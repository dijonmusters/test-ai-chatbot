import 'server-only'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/db_types'

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

async function getCookies(
  cookies: () => ReadonlyRequestCookies
): Promise<ReadonlyRequestCookies> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(cookies())
    }, 1000)
  })
}

export async function POST(req: Request) {
  const cookieList = await getCookies(cookies)
  console.log(cookieList.getAll())
  const testCookies = () => cookieList
  const supabase = createRouteHandlerClient<Database>({ cookies: testCookies })
  const json = await req.json()
  const { messages, previewToken } = json
  const userId = (await auth())?.user.id

  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  if (previewToken) {
    configuration.apiKey = previewToken
  }

  const res = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
    stream: true
  })

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      const title = json.messages[0].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
      const payload = {
        id,
        title,
        userId,
        createdAt,
        path,
        messages: [
          ...messages,
          {
            content: completion,
            role: 'assistant'
          }
        ]
      }
      // Insert chat into database.
      const { data, error } = await supabase
        .from('chats')
        .upsert({ id, payload })
        .select()
      console.log({ data, error })
    }
  })

  return new StreamingTextResponse(stream)
}
