import { EventEmitter } from 'events';
import { Logger } from '../../sdk/shared/logger';

export interface AlertRule {
  name: string;
  condition: string;
  threshold: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
  cooldown: number;
  lastTriggered?: Date;
}

export interface Alert {
  rule: string;
  severity: string;
  message: string;
  value: number;
  timestamp: Date;
}

export class AlertsManager extends EventEmitter {
  private logger: Logger;
  private rules: Map<string, AlertRule> = new Map();
  private alerts: Alert[] = [];

  constructor(logger: Logger) {
    super();
    this.logger = logger.child({ service: 'AlertsManager' });
  }

  addRule(rule: AlertRule): void {
    this.rules.set(rule.name, rule);
    this.logger.info(`Alert rule added: ${rule.name}`);
  }

  addRules(rules: AlertRule[]): void {
    for (const rule of rules) {
      this.addRule(rule);
    }
  }

  checkCondition(rule: AlertRule, value: number): boolean {
    switch (rule.condition) {
      case 'greater':
        return value > rule.threshold;
      case 'less':
        return value < rule.threshold;
      case 'equal':
        return value === rule.threshold;
      case 'not_equal':
        return value !== rule.threshold;
      default:
        return false;
    }
  }

  evaluate(metric: string, value: number): Alert | null {
    for (const [_, rule] of this.rules) {
      if (!rule.name.includes(metric)) continue;
      
      // Check cooldown
      if (rule.lastTriggered) {
        const cooldownMs = rule.cooldown * 1000;
        if (Date.now() - rule.lastTriggered.getTime() < cooldownMs) {
          continue;
        }
      }
      
      if (this.checkCondition(rule, value)) {
        const alert: Alert = {
          rule: rule.name,
          severity: rule.severity,
          message: `Alert triggered: ${rule.name} = ${value} (threshold: ${rule.threshold})`,
          value,
          timestamp: new Date()
        };
        
        rule.lastTriggered = new Date();
        this.alerts.push(alert);
        
        if (this.alerts.length > 1000) {
          this.alerts = this.alerts.slice(-1000);
        }
        
        this.emit('alert-triggered', alert);
        this.logger.warn('Alert triggered:', alert);
        
        return alert;
      }
    }
    
    return null;
  }

  getAlerts(severity?: string): Alert[] {
    if (severity) {
      return this.alerts.filter(a => a.severity === severity);
    }
    return this.alerts;
  }

  getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  clearAlerts(): void {
    this.alerts = [];
    this.logger.info('Alerts cleared');
  }

  async stop(): Promise<void> {
    this.logger.info('Alerts manager stopped');
  }
}
