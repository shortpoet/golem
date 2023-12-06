// import pLimit from 'p-limit'
// import type { types } from '~~/utils/types'
export function useDeta() {
  const { isDetaEnabled, deta } = {
    isDetaEnabled: ref(false),
    deta: {
      conversation: {
        create: (convo: any) => convo,
        update: (convo: any) => convo,
        delete: (convo: any) => convo,
        list: async () => [{ key: "test" }],
        map: () => [],
        sync: (id: string) => id,
        key: "test",
      },
      message: {
        create: (msg: any) => msg,
        update: (msg: any) => msg,
        delete: (msg: any) => msg,
        list: () => [],
        map: () => [],
        sync: (id: string) => id,
      },
    },
  };
  return {
    isDetaEnabled,
    deta,
  };
}

// export function useDeta() {
//     const idb = useIDB()
//     const client = useClient()
//     const isDetaEnabled = useState('is-deta-enabled', () => false)

//     const deta = {
//         conversation: {
//             async get(id: string) {
//                 const result = await client.deta.conversations.get.query({ id })
//                 return parseDateFields(result, ['updatedAt', 'createdAt'] as const)
//             },
//             async create(conversation: types.Conversation) {
//                 logger.info('Creating conversation', conversation)
//                 return await client.deta.conversations.create.mutate(conversation)
//             },
//             async update(conversation: types.Conversation) {
//                 logger.info('Updating conversation', conversation)
//                 return await client.deta.conversations.update.mutate(conversation)
//             },
//             async delete(id: string) {
//                 const res = await client.deta.conversations.delete.mutate({ id })
//                 const conversationMessageList = await client.deta.messages.list.query({ conversationId: id })
//                 const messageIds = conversationMessageList.map(item => item.key)
//                 const limit = pLimit(10)
//                 await Promise.all(messageIds.map(id => limit(() => client.deta.messages.delete.mutate({ id }))))
//                 logger.info('Deleted conversation', id, 'and', messageIds.length, 'messages')
//                 return res
//             },
//             async list() {
//                 const conversations = await client.deta.conversations.list.query()
//                 return conversations.map(conversation => parseDateFields(conversation, ['updatedAt', 'createdAt'] as const))
//             },
//             async sync(id: string) {
//                 const conversation = await deta.conversation.get(id)
//                 if (!conversation) {
//                     throw new DetaError(`Conversation not found with id ${id}`, 'NOT_FOUND')
//                 }
//                 const messages = await client.deta.messages.list.query({ conversationId: id })
//                 // Check if the conversation exists in the local db
//                 const localConversation = await idb.table('conversations').get(id)
//                 const newConversation = {
//                     id: conversation.key as string,
//                     title: conversation.title,
//                     updatedAt: conversation.updatedAt,
//                     createdAt: conversation.createdAt,
//                     messages: messages.map(message => parseDateFields(message, ['updatedAt', 'createdAt'] as const)),
//                 }
//                 if (!localConversation) {
//                     // If not, create it
//                     logger.info('Creating conversation', newConversation.id)
//                     await idb.table('conversations').add(newConversation)
//                 }
//                 else {
//                     logger.info('Updating conversation', newConversation.id)
//                     // If it does, update it
//                     try {
//                         await idb.table('conversations').put(newConversation)
//                     }
//                     catch (e) {
//                         logger.error(e)
//                     }
//                 }
//             },
//         },
//         message: {
//             async get(id: string) {
//                 return await client.deta.messages.get.query({ id })
//             },
//             async create(message: types.Message) {
//                 logger.info('Creating message', message.id)
//                 return await client.deta.messages.create.mutate(message)
//             },
//             update: async (message: types.Message) => {
//                 logger.info('Updating message', message.id)
//                 return await client.deta.messages.update.mutate(message)
//             },
//             delete: async (id: string) => {
//                 logger.info('Deleting message', id)
//                 return await client.deta.messages.delete.mutate({ id })
//             },
//         },
//     }

//     return {
//         isDetaEnabled,
//         deta,
//     }
// }

// type DetaErrorCode = 'NOT_FOUND' | null

// export class DetaError extends Error {
//     code: DetaErrorCode = null
//     constructor(message: string, code: DetaErrorCode) {
//         super(message)
//         this.code = code
//     }
// }
