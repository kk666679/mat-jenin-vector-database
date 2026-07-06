'use client';

import { useCallback, useRef, useState } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageActions,
  MessageAction,
  MessageToolbar,
  MessageResponse,
} from '@/components/ai-elements/message';
import {
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
} from '@/components/ai-elements/sources';
import { Shimmer } from '@/components/ai-elements/shimmer';
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from '@/components/ai-elements/reasoning';
import { Suggestions, Suggestion } from '@/components/ai-elements/suggestion';
import { Persona } from '@/components/ai-elements/persona';
import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
  ChainOfThoughtContent,
} from '@/components/ai-elements/chain-of-thought';
import {
  Plan,
  PlanHeader,
  PlanTitle,
  PlanContent,
} from '@/components/ai-elements/plan';
import {
  Task,
  TaskTrigger,
  TaskContent,
  TaskItem,
} from '@/components/ai-elements/task';
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool';
import {
  Agent,
  AgentHeader,
  AgentContent,
  AgentInstructions,
  AgentTools,
  AgentTool,
  AgentOutput,
} from '@/components/ai-elements/agent';
import {
  Artifact,
  ArtifactHeader,
  ArtifactTitle,
  ArtifactDescription,
  ArtifactActions,
  ArtifactAction,
  ArtifactContent,
} from '@/components/ai-elements/artifact';
import {
  Attachments,
  Attachment,
  AttachmentPreview,
  AttachmentInfo,
  AttachmentRemove,
} from '@/components/ai-elements/attachments';
import {
  Checkpoint,
  CheckpointIcon,
  CheckpointTrigger,
} from '@/components/ai-elements/checkpoint';
import {
  ModelSelector,
  ModelSelectorTrigger,
  ModelSelectorContent,
  ModelSelectorDialog,
  ModelSelectorInput,
  ModelSelectorList,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorItem,
  ModelSelectorSeparator,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
} from '@/components/ai-elements/model-selector';
import {
  PromptInput,
  PromptInputProvider,
  PromptInputTextarea,
  PromptInputButton,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionMenuItem,
  PromptInputSubmit,
  PromptInputFooter,
  usePromptInputAttachments,
} from '@/components/ai-elements/prompt-input';
import {
  OpenIn,
  OpenInContent,
  OpenInLabel,
  OpenInSeparator,
  OpenInTrigger,
  OpenInChatGPT,
  OpenInClaude,
  OpenInT3,
  OpenInScira,
  OpenInv0,
  OpenInCursor,
} from '@/components/ai-elements/open-in-chat';
import {
  CopyIcon,
  StopCircleIcon,
  FileTextIcon,
  DownloadIcon,
  CheckIcon,
  ZapIcon,
  MessageSquareIcon,
  PlusIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  ImageIcon,
  PaperclipIcon,
} from 'lucide-react';

// Available models for the selector
const AVAILABLE_MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'anthropic' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'google' },
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
  sources?: Array<{
    documentTitle: string;
    chunkContent: string;
    score: number;
    url?: string;
  }>;
  chainOfThought?: Array<{
    step: string;
    description: string;
    status: 'complete' | 'active' | 'pending';
  }>;
  plan?: Array<{
    title: string;
    description: string;
  }>;
  tasks?: Array<{
    id: string;
    title: string;
    status: 'pending' | 'completed';
  }>;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    reasoningTokens?: number;
    cachedInputTokens?: number;
  };
  checkpoint?: {
    id: string;
    label: string;
  };
  // New fields
  agent?: {
    name: string;
    model?: string;
    instructions?: string;
    tools?: Array<{
      name: string;
      description?: string;
      jsonSchema?: object;
    }>;
    outputSchema?: string;
  };
  artifact?: {
    id: string;
    title: string;
    description?: string;
    type: 'code' | 'document' | 'image' | 'other';
    content: string;
    language?: string;
  };
  toolCalls?: Array<{
    id: string;
    name: string;
    input?: Record<string, unknown>;
    output?: string;
    state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error';
    errorText?: string;
  }>;
}

interface StreamPart {
  type:
    | 'content'
    | 'reasoning'
    | 'source'
    | 'done'
    | 'chain-of-thought'
    | 'plan'
    | 'task'
    | 'usage'
    | 'citation'
    | 'checkpoint'
    | 'tool'
    | 'confirmation'
    | 'agent'
    | 'artifact'
    | 'model';
  content?: string;
  reasoning?: string;
  source?: {
    documentTitle: string;
    chunkContent: string;
    score: number;
    url?: string;
  };
  chainOfThought?: Message['chainOfThought'];
  plan?: Message['plan'];
  task?: Message['tasks'];
  usage?: Message['usage'];
  checkpoint?: Message['checkpoint'];
  tool?: {
    name: string;
    input?: Record<string, unknown>;
    output?: string;
    state?: 'input-available' | 'input-streaming' | 'output-available' | 'output-error';
    errorText?: string;
  };
  confirmation?: {
    id: string;
    state: 'approval-requested' | 'approval-responded';
    toolName?: string;
  };
  agent?: Message['agent'];
  artifact?: Message['artifact'];
  model?: {
    id: string;
    name: string;
  };
}

const SUGGESTIONS = [
  'What is this document about?',
  'Summarize the main points',
  'Find specific information',
  'Explain in detail',
];

export default function ChatPage() {
  useTheme({ defaultTheme: 'system' });

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [currentReasoning, setCurrentReasoning] = useState('');

  const [_currentChainOfThought, setCurrentChainOfThought] = useState<
    Message['chainOfThought']
  >([]);
  const [currentPlan, setCurrentPlan] = useState<Message['plan']>([]);
  const [_currentTasks, setCurrentTasks] = useState<Message['tasks']>([]);
  const [currentUsage, setCurrentUsage] = useState<Message['usage']>();

  const [_currentTool, setCurrentTool] = useState<StreamPart['tool'] | null>(
    null
  );
  const [_pendingConfirmation, setPendingConfirmation] = useState<
    StreamPart['confirmation'] | null
  >(null);

  // New state for enhanced features
  const [selectedModel, setSelectedModel] = useState(
    AVAILABLE_MODELS[0] ?? { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' }
  );
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<Message['agent'] | null>(
    null
  );
  const [currentArtifact, setCurrentArtifact] =
    useState<Message['artifact'] | null>(null);
  const [currentCheckpoint, setCurrentCheckpoint] =
    useState<Message['checkpoint'] | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleCopyMessage = useCallback(async (content: string) => {
    await navigator.clipboard.writeText(content);
  }, []);

  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      setIsStreaming(false);
    }
  }, []);

  const attachments = usePromptInputAttachments();

  const handleSubmit = useCallback(
    async (message: { text: string; files: any[] }) => {
      // Use the message.text and message.files from PromptInput
      const textInput = message.text;
      const fileAttachments = message.files;

      if (!textInput.trim() && fileAttachments.length === 0) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: textInput,
      };

      setMessages((prev) => [...prev, userMessage]);
      const currentInput = textInput;
      setLoading(true);
      setIsStreaming(true);
      setStreamedContent('');
      setCurrentReasoning('');
      setCurrentChainOfThought([]);
      setCurrentPlan([]);
      setCurrentTasks([]);
      setCurrentTool(null);
      setPendingConfirmation(null);
      setCurrentAgent(null);
      setCurrentArtifact(null);
      setCurrentCheckpoint(null);

      abortControllerRef.current = new AbortController();

      try {
        const res = await fetch('/api/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: currentInput,
            model: selectedModel.id,
            attachments: attachments.files.map((a) => ({
              filename: a.filename,
              mediaType: a.mediaType,
              url: a.url,
              type: a.type,
            })),
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!res.ok) {
          throw new Error('Failed to fetch response');
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';
        let fullReasoning = '';
        const sources: Message['sources'] = [];
        const chainOfThought: Message['chainOfThought'] = [];
        const plan: Message['plan'] = [];
        const tasks: Message['tasks'] = [];
        const toolCalls: Message['toolCalls'] = [];
        let usage: Message['usage'] | undefined;
        let agent: Message['agent'] | undefined;
        let artifact: Message['artifact'] | undefined;

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6)) as StreamPart;

                  if (data.type === 'content' && data.content) {
                    fullContent += data.content;
                    setStreamedContent(fullContent);
                  } else if (data.type === 'reasoning' && data.reasoning) {
                    fullReasoning += data.reasoning;
                    setCurrentReasoning(fullReasoning);
                  } else if (data.type === 'source' && data.source) {
                    sources.push(data.source);
                  } else if (data.type === 'chain-of-thought' && data.chainOfThought) {
                    chainOfThought.push(...data.chainOfThought);
                    setCurrentChainOfThought([...chainOfThought]);
                  } else if (data.type === 'plan' && data.plan) {
                    plan.push(...data.plan);
                    setCurrentPlan([...plan]);
                  } else if (data.type === 'task' && data.task) {
                    tasks.push(...data.task);
                    setCurrentTasks([...tasks]);
                  } else if (data.type === 'usage' && data.usage) {
                    usage = data.usage;
                    setCurrentUsage(usage);
                  } else if (data.type === 'tool' && data.tool) {
                    const existingTool = toolCalls.find(
                      (t) => t.name === data.tool!.name
                    );
                    if (existingTool) {
                      // Update only defined properties to avoid undefined assignment with exactOptionalPropertyTypes
                      if (data.tool.input !== undefined) {
                        existingTool.input = data.tool.input;
                      }
                      if (data.tool.output !== undefined) {
                        existingTool.output = data.tool.output;
                      }
                      if (data.tool.state !== undefined) {
                        existingTool.state = data.tool.state;
                      }
                      if (data.tool.errorText !== undefined) {
                        existingTool.errorText = data.tool.errorText;
                      }
                    } else {
                      const newToolCall: NonNullable<Message['toolCalls']>[0] = {
                        id: Date.now().toString() + Math.random(),
                        name: data.tool.name,
                        state: data.tool.state || 'input-available',
                      };
                      if (data.tool.input !== undefined) {
                        newToolCall.input = data.tool.input;
                      }
                      if (data.tool.output !== undefined) {
                        newToolCall.output = data.tool.output;
                      }
                      if (data.tool.errorText !== undefined) {
                        newToolCall.errorText = data.tool.errorText;
                      }
                      toolCalls.push(newToolCall);
                    }
                    setCurrentTool(data.tool);
                  } else if (data.type === 'confirmation' && data.confirmation) {
                    setPendingConfirmation(data.confirmation);
                  } else if (data.type === 'agent' && data.agent) {
                    agent = data.agent;
                    setCurrentAgent(data.agent);
                  } else if (data.type === 'artifact' && data.artifact) {
                    artifact = data.artifact;
                    setCurrentArtifact(data.artifact);
                  } else if (data.type === 'checkpoint' && data.checkpoint) {
                    setCurrentCheckpoint(data.checkpoint);
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fullContent || 'I apologize, but I could not generate a response.',
          ...(fullReasoning ? { reasoning: fullReasoning } : {}),
          ...(sources.length > 0 ? { sources } : {}),
          ...(chainOfThought.length > 0 ? { chainOfThought } : {}),
          ...(plan.length > 0 ? { plan } : {}),
          ...(tasks.length > 0 ? { tasks } : {}),
          ...(usage ? { usage } : {}),
          ...(toolCalls.length > 0 ? { toolCalls } : {}),
          ...(agent ? { agent } : {}),
          ...(artifact ? { artifact } : {}),
          ...(currentCheckpoint ? { checkpoint: currentCheckpoint } : {}),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Failed to send message:', error);

          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'Sorry, I encountered an error processing your request. Please try again.',
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      } finally {
        setLoading(false);
        setIsStreaming(false);
        setStreamedContent('');
        setCurrentReasoning('');
        setCurrentChainOfThought([]);
        setCurrentPlan([]);
        setCurrentTasks([]);
        setCurrentUsage(undefined);
        setCurrentTool(null);
        setPendingConfirmation(null);
        setCurrentAgent(null);
        setCurrentArtifact(null);
        setCurrentCheckpoint(null);
        abortControllerRef.current = null;
      }
    },
    [selectedModel, attachments]
  );

  const handleSuggestionClick = useCallback((suggestion: string) => {
    // The PromptInput doesn't have a programmatic setter; we can use the form's input field.
    // We'll find the textarea and set its value.
    const textarea = document.querySelector(
      'textarea[placeholder="Ask a question about your documents..."]'
    ) as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = suggestion;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if (form) {
          form.requestSubmit();
        }
      }
    },
    []
  );

  const handleModelSelect = useCallback(
    (model: (typeof AVAILABLE_MODELS)[0]) => {
      setSelectedModel(model);
      setModelSelectorOpen(false);
    },
    []
  );

  // Render tool call content
  const renderToolCall = (toolCall: NonNullable<Message['toolCalls']>[0]) => {
    const toolState =
      toolCall.state === 'output-error'
        ? 'output-error'
        : toolCall.state === 'output-available'
        ? 'output-available'
        : 'input-available';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toolType = 'tool' as any;
    return (
      <Tool
        key={toolCall.id}
        defaultOpen={
          toolCall.state === 'input-available' ||
          toolCall.state === 'input-streaming'
        }
      >
        <ToolHeader
          type={toolType}
          state={toolState as 'input-available'}
          title={toolCall.name}
        />
        <ToolContent>
          {toolCall.input && <ToolInput input={toolCall.input} />}
          {toolCall.output && (
            <ToolOutput output={toolCall.output} errorText={toolCall.errorText} />
          )}
        </ToolContent>
      </Tool>
    );
  };

  return (
    <PromptInputProvider>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Persona state={loading ? 'thinking' : 'idle'} variant="obsidian" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">RAG Chat</h1>
              <p className="text-sm text-muted-foreground">
                AI-powered document assistant
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Model Selector */}
            <ModelSelector
              open={modelSelectorOpen}
              onOpenChange={setModelSelectorOpen}
            >
              <ModelSelectorTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <ModelSelectorLogo provider={selectedModel.provider as any} />
                  {selectedModel.name}
                  <ChevronDownIcon className="size-4" />
                </Button>
              </ModelSelectorTrigger>
              <ModelSelectorContent>
                <ModelSelectorDialog>
                  <ModelSelectorInput placeholder="Search models..." />
                  <ModelSelectorList>
                    <ModelSelectorEmpty>No models found</ModelSelectorEmpty>
                    <ModelSelectorGroup heading="OpenAI">
                      {AVAILABLE_MODELS.filter((m) => m.provider === 'openai').map(
                        (model) => (
                          <ModelSelectorItem
                            key={model.id}
                            onSelect={() => handleModelSelect(model)}
                          >
                            <ModelSelectorLogoGroup>
                              <ModelSelectorLogo provider="openai" />
                            </ModelSelectorLogoGroup>
                            <ModelSelectorName>{model.name}</ModelSelectorName>
                            {selectedModel.id === model.id && (
                              <CheckIcon className="size-4" />
                            )}
                          </ModelSelectorItem>
                        )
                      )}
                    </ModelSelectorGroup>
                    <ModelSelectorSeparator />
                    <ModelSelectorGroup heading="Anthropic">
                      {AVAILABLE_MODELS.filter(
                        (m) => m.provider === 'anthropic'
                      ).map((model) => (
                        <ModelSelectorItem
                          key={model.id}
                          onSelect={() => handleModelSelect(model)}
                        >
                          <ModelSelectorLogoGroup>
                            <ModelSelectorLogo provider="anthropic" />
                          </ModelSelectorLogoGroup>
                          <ModelSelectorName>{model.name}</ModelSelectorName>
                          {selectedModel.id === model.id && (
                            <CheckIcon className="size-4" />
                          )}
                        </ModelSelectorItem>
                      ))}
                    </ModelSelectorGroup>
                    <ModelSelectorSeparator />
                    <ModelSelectorGroup heading="Google">
                      {AVAILABLE_MODELS.filter((m) => m.provider === 'google').map(
                        (model) => (
                          <ModelSelectorItem
                            key={model.id}
                            onSelect={() => handleModelSelect(model)}
                          >
                            <ModelSelectorLogoGroup>
                              <ModelSelectorLogo provider="google" />
                            </ModelSelectorLogoGroup>
                            <ModelSelectorName>{model.name}</ModelSelectorName>
                            {selectedModel.id === model.id && (
                              <CheckIcon className="size-4" />
                            )}
                          </ModelSelectorItem>
                        )
                      )}
                    </ModelSelectorGroup>
                  </ModelSelectorList>
                </ModelSelectorDialog>
              </ModelSelectorContent>
            </ModelSelector>

            {currentUsage && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <ZapIcon className="size-3" />
                {(currentUsage.inputTokens + currentUsage.outputTokens).toLocaleString()}{' '}
                tokens
              </div>
            )}
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const content = messages
                    .map((m) => `**${m.role}:** ${m.content}`)
                    .join('\n\n');
                  const blob = new Blob([content], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'conversation.md';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <DownloadIcon className="size-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 overflow-hidden mb-4 rounded-lg border bg-card">
          <Conversation>
            <ConversationContent>
              {messages.length === 0 && !loading ? (
                <ConversationEmptyState
                  icon={<MessageSquareIcon className="size-12 text-muted-foreground" />}
                  title="Welcome to RAG Chat"
                  description="Ask questions about your documents and get AI-powered answers."
                />
              ) : (
                <>
                  {messages.map((message) => (
                    <Message key={message.id} from={message.role}>
                      <MessageContent>
                        {/* Checkpoint display */}
                        {message.checkpoint && (
                          <Checkpoint>
                            <CheckpointIcon />
                            <CheckpointTrigger tooltip={message.checkpoint.label}>
                              {message.checkpoint.label}
                            </CheckpointTrigger>
                          </Checkpoint>
                        )}

                        {/* Agent display */}
                        {message.agent && (
                          <Agent>
                            <AgentHeader
                              name={message.agent.name}
                              {...(message.agent.model
                                ? { model: message.agent.model }
                                : {})}
                            />
                            <AgentContent>
                              {message.agent.instructions && (
                                <AgentInstructions>
                                  {message.agent.instructions}
                                </AgentInstructions>
                              )}
                              {message.agent.tools &&
                                message.agent.tools.length > 0 && (
                                  <AgentTools type="single" defaultValue="tools">
                                    {message.agent.tools.map((tool, i) => (
                                      <AgentTool
                                        key={i}
                                        value="tools"
                                        tool={tool as any}
                                      />
                                    ))}
                                  </AgentTools>
                                )}
                              {message.agent.outputSchema && (
                                <AgentOutput schema={message.agent.outputSchema} />
                              )}
                            </AgentContent>
                          </Agent>
                        )}

                        {/* Artifact display */}
                        {message.artifact && (
                          <Artifact>
                            <ArtifactHeader>
                              <ArtifactTitle>{message.artifact.title}</ArtifactTitle>
                              {message.artifact.description && (
                                <ArtifactDescription>
                                  {message.artifact.description}
                                </ArtifactDescription>
                              )}
                              <ArtifactActions>
                                <ArtifactAction
                                  tooltip="Copy code"
                                  onClick={() =>
                                    message.artifact &&
                                    handleCopyMessage(message.artifact.content)
                                  }
                                >
                                  <CopyIcon className="size-4" />
                                </ArtifactAction>
                              </ArtifactActions>
                            </ArtifactHeader>
                            <ArtifactContent>
                              <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                                <code>{message.artifact.content}</code>
                              </pre>
                            </ArtifactContent>
                          </Artifact>
                        )}

                        {message.reasoning && (
                          <Reasoning isStreaming={false}>
                            <ReasoningTrigger />
                            <ReasoningContent>{message.reasoning}</ReasoningContent>
                          </Reasoning>
                        )}

                        {message.chainOfThought &&
                          message.chainOfThought.length > 0 && (
                            <ChainOfThought>
                              <ChainOfThoughtHeader>Chain of Thought</ChainOfThoughtHeader>
                              <ChainOfThoughtContent>
                                {message.chainOfThought.map((step, i) => (
                                  <ChainOfThoughtStep
                                    key={i}
                                    label={step.step}
                                    description={step.description}
                                    status={step.status}
                                  />
                                ))}
                              </ChainOfThoughtContent>
                            </ChainOfThought>
                          )}

                        {message.plan && message.plan.length > 0 && (
                          <Plan isStreaming={false}>
                            <PlanHeader>
                              <PlanTitle>Plan</PlanTitle>
                            </PlanHeader>
                            <PlanContent>
                              {message.plan.map((item, i) => (
                                <div key={i} className="text-sm">
                                  <p className="font-medium">{item.title}</p>
                                  <p className="text-muted-foreground text-xs">
                                    {item.description}
                                  </p>
                                </div>
                              ))}
                            </PlanContent>
                          </Plan>
                        )}

                        {message.tasks && message.tasks.length > 0 && (
                          <Task>
                            <TaskTrigger title="Tasks" />
                            <TaskContent>
                              {message.tasks.map((task) => (
                                <TaskItem key={task.id}>
                                  {task.title} - {task.status}
                                </TaskItem>
                              ))}
                            </TaskContent>
                          </Task>
                        )}

                        {/* Tool calls display */}
                        {message.toolCalls && message.toolCalls.length > 0 && (
                          <div className="space-y-2">
                            {message.toolCalls.map(renderToolCall)}
                          </div>
                        )}

                        <MessageResponse>{message.content}</MessageResponse>
                      </MessageContent>

                      <MessageToolbar>
                        <MessageActions>
                          <MessageAction
                            tooltip="Copy message"
                            onClick={() => handleCopyMessage(message.content)}
                          >
                            <CopyIcon className="size-4" />
                          </MessageAction>
                        </MessageActions>
                      </MessageToolbar>

                      {message.sources && message.sources.length > 0 && (
                        <Sources>
                          <SourcesTrigger count={message.sources.length}>
                            <FileTextIcon className="size-4 mr-1" />
                            {message.sources.length} sources
                          </SourcesTrigger>
                          <SourcesContent>
                            {message.sources.map((source, i) => (
                              <Source
                                key={i}
                                href={source.url || `#document-${i}`}
                                title={source.documentTitle}
                              >
                                <FileTextIcon className="size-4" />
                                <span className="block font-medium">
                                  {source.documentTitle}
                                </span>
                              </Source>
                            ))}
                          </SourcesContent>
                        </Sources>
                      )}
                    </Message>
                  ))}

                  {/* Streaming response */}
                  {loading && isStreaming && (
                    <Message from="assistant">
                      <MessageContent>
                        {/* Checkpoint during streaming */}
                        {currentCheckpoint && (
                          <Checkpoint>
                            <CheckpointIcon />
                            <CheckpointTrigger tooltip={currentCheckpoint.label}>
                              {currentCheckpoint.label}
                            </CheckpointTrigger>
                          </Checkpoint>
                        )}

                        {/* Agent during streaming */}
                        {currentAgent && (
                          <Agent>
                            <AgentHeader
                              name={currentAgent.name}
                              {...(currentAgent.model
                                ? { model: currentAgent.model }
                                : {})}
                            />
                          </Agent>
                        )}

                        {/* Artifact during streaming */}
                        {currentArtifact && (
                          <Artifact>
                            <ArtifactHeader>
                              <ArtifactTitle>{currentArtifact.title}</ArtifactTitle>
                              <ArtifactActions>
                                <ArtifactAction
                                  tooltip="Copy code"
                                  onClick={() =>
                                    currentArtifact &&
                                    handleCopyMessage(currentArtifact.content)
                                  }
                                >
                                  <CopyIcon className="size-4" />
                                </ArtifactAction>
                              </ArtifactActions>
                            </ArtifactHeader>
                            <ArtifactContent>
                              <Shimmer>{currentArtifact.content}</Shimmer>
                            </ArtifactContent>
                          </Artifact>
                        )}

                        {currentReasoning && (
                          <Reasoning isStreaming={true}>
                            <ReasoningTrigger />
                            <ReasoningContent>{currentReasoning}</ReasoningContent>
                          </Reasoning>
                        )}

                        {currentPlan && currentPlan.length > 0 && (
                          <Plan isStreaming={true}>
                            <PlanHeader>
                              <PlanTitle>Plan</PlanTitle>
                            </PlanHeader>
                            <PlanContent>
                              {currentPlan.map((item, i) => (
                                <div key={i} className="text-sm">
                                  <Shimmer>{item.title}</Shimmer>
                                </div>
                              ))}
                            </PlanContent>
                          </Plan>
                        )}

                        <div className="whitespace-pre-wrap">
                          {streamedContent}
                          <span className="animate-pulse inline-block w-2 h-4 bg-current ml-1" />
                        </div>
                      </MessageContent>
                      <MessageToolbar>
                        <MessageActions>
                          <MessageAction
                            tooltip="Stop generation"
                            onClick={handleStopGeneration}
                          >
                            <StopCircleIcon className="size-4" />
                          </MessageAction>
                        </MessageActions>
                      </MessageToolbar>
                    </Message>
                  )}

                  {/* Loading indicator */}
                  {loading && !isStreaming && (
                    <Message from="assistant">
                      <MessageContent>
                        <div className="flex items-center gap-2">
                          <Shimmer>Thinking</Shimmer>
                          <span className="animate-pulse">...</span>
                        </div>
                      </MessageContent>
                    </Message>
                  )}
                </>
              )}
            </ConversationContent>

            <ConversationScrollButton>
              <span className="sr-only">Scroll to bottom</span>
            </ConversationScrollButton>

            <div ref={messagesEndRef} />
          </Conversation>
        </div>

        {/* Suggestions */}
        {messages.length === 0 && !loading && (
          <div className="mb-4">
            <Suggestions>
              {SUGGESTIONS.map((suggestion, index) => (
                <Suggestion
                  key={index}
                  suggestion={suggestion}
                  onClick={handleSuggestionClick}
                />
              ))}
            </Suggestions>
          </div>
        )}

        {/* Input Form with PromptInput */}
        <div className="rounded-lg border bg-card p-4">
          <PromptInput
            onSubmit={handleSubmit}
            accept="image/*,.pdf,.doc,.docx,.txt"
            multiple
            maxFiles={5}
            maxFileSize={10 * 1024 * 1024}
          >
            {/* Attachments display */}
            {attachments.files.length > 0 && (
              <PromptInputFooter>
                <Attachments variant="inline">
                  {attachments.files.map((file) => (
                    <Attachment
                      key={file.id}
                      data={file}
                      onRemove={() => attachments.remove(file.id)}
                    >
                      <AttachmentPreview />
                      <AttachmentInfo showMediaType />
                      <AttachmentRemove />
                    </Attachment>
                  ))}
                </Attachments>
              </PromptInputFooter>
            )}

            <PromptInputFooter>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger>
                  <PlusIcon className="size-4" />
                </PromptInputActionMenuTrigger>
                <PromptInputActionMenuContent>
                  <PromptInputActionMenuItem
                    onSelect={() => {
                      const fileInput = document.createElement('input');
                      fileInput.type = 'file';
                      fileInput.multiple = true;
                      fileInput.accept = 'image/*,.pdf,.doc,.docx,.txt';
                      fileInput.onchange = (e) => {
                        const files = (e.target as HTMLInputElement).files;
                        if (files) attachments.add(files);
                      };
                      fileInput.click();
                    }}
                  >
                    <PaperclipIcon className="size-4 mr-2" />
                    Attach files
                  </PromptInputActionMenuItem>
                  <PromptInputActionMenuItem
                    onSelect={() => {
                      const fileInput = document.createElement('input');
                      fileInput.type = 'file';
                      fileInput.accept = 'image/*';
                      fileInput.onchange = (e) => {
                        const files = (e.target as HTMLInputElement).files;
                        if (files) attachments.add(files);
                      };
                      fileInput.click();
                    }}
                  >
                    <ImageIcon className="size-4 mr-2" />
                    Add image
                  </PromptInputActionMenuItem>
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>

              <div className="flex-1">
                <PromptInputTextarea
                  placeholder="Ask a question about your documents..."
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />
              </div>

              {/* Open In Chat dropdown for last assistant message */}
              {messages.length > 0 &&
                messages[messages.length - 1]?.role === 'assistant' && (
                  <OpenIn query={messages[messages.length - 1]?.content || ''}>
                    <OpenInTrigger asChild>
                      <PromptInputButton variant="ghost">
                        <ExternalLinkIcon className="size-4" />
                      </PromptInputButton>
                    </OpenInTrigger>
                    <OpenInContent>
                      <OpenInLabel>Open in...</OpenInLabel>
                      <OpenInSeparator />
                      <OpenInChatGPT />
                      <OpenInClaude />
                      <OpenInT3 />
                      <OpenInScira />
                      <OpenInv0 />
                      <OpenInCursor />
                    </OpenInContent>
                  </OpenIn>
                )}

              <PromptInputSubmit
                {...(loading ? { status: 'streaming' } : {})}
                onStop={handleStopGeneration}
              />
            </PromptInputFooter>
          </PromptInput>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </PromptInputProvider>
  );
}