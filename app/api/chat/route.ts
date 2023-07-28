// import 'server-only'
// import { OpenAIStream, StreamingTextResponse } from 'ai'
// import { Configuration, OpenAIApi } from 'openai-edge'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/db_types'

// import { nanoid } from '@/lib/utils'
import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY
// })

// const openai = new OpenAIApi(configuration)

export async function POST(req: Request) {
  // const chocChip = cookies()
  // const supabase = createRouteHandlerClient<Database>({
  //   cookies: () => chocChip
  // })
  const supabase = createRouteHandlerClient<Database>({
    cookies
  })
  const { data, error } = await supabase
    .from('tests')
    .insert({ title: 'outside stream' })

  console.log({ data, error })

  return NextResponse.json({ data, error })
  // const json = await req.json()
  // const { messages, previewToken } = json

  // const {
  //   data: { user }
  // } = await supabase.auth.getUser()

  // if (!user) {
  //   return new Response('Unauthorized', {
  //     status: 401
  //   })
  // }

  // if (previewToken) {
  //   configuration.apiKey = previewToken
  // }

  // const res = await openai.createChatCompletion({
  //   model: 'gpt-3.5-turbo',
  //   messages,
  //   temperature: 0.7,
  //   stream: true
  // })

  // const stream = OpenAIStream(res, {
  //   async onCompletion(completion) {
  //     const title = json.messages[0].content.substring(0, 100)
  //     const id = json.id ?? nanoid()
  //     const createdAt = Date.now()
  //     const path = `/chat/${id}`
  //     const payload = {
  //       id,
  //       title,
  //       userId: user.id,
  //       createdAt,
  //       path,
  //       messages: [
  //         ...messages,
  //         {
  //           content: completion,
  //           role: 'assistant'
  //         }
  //       ]
  //     }
  //     await supabase.from('tests').insert({ title: 'inside stream' })
  //     // Insert chat into database.
  //     const { data, error } = await supabase
  //       .from('chats')
  //       .upsert({ id, payload })
  //       .select()
  //     console.log({ data, error })
  //   }
  // })

  // return new StreamingTextResponse(stream)
}
