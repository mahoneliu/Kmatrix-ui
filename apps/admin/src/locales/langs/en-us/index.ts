import common from './common';
import system from './system';
import pages from './pages';
import aiChat from './ai-chat';
import aiKnowledge from './ai-knowledge';
import aiWorkflow from './ai-workflow';
import aiModel from './ai-model';

const { ai_rateLimit, ...aiChatFinal } = aiChat;
const { nodeDefinition, ...aiWorkflowFinal } = aiWorkflow;

const local: App.I18n.Schema = {
  ...common,
  ...system,
  page: {
    ...pages,
    nodeDefinition,
    ai_rateLimit
  },
  ai: {
    ...aiChatFinal,
    ...aiKnowledge,
    ...aiWorkflowFinal,
    ...aiModel
  }
};

export default local;
