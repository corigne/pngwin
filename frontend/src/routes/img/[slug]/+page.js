import { error } from "@sveltejs/kit"
import { convertBuffer2BlobURL } from "$lib/convert"

export const load = async ({fetch, params}) => {

  const id = params.slug

  const post_res = await fetch(`http://localhost:3000/api/getPost?imageID=${id}`)
  const post = await post_res.json()

  if (!post.success){
    throw error(404, "Image Not Found, Please Try Again")
  }

  const img_res = await fetch(`http://localhost:3000/api/getImage?imageID=${id}`)
  const img = await img_res.json()
  const buff = Uint8Array.from([...img.buffer.data])

  if (!img.buffer){
    throw error(500, `Unable to retrieve image data for ID:${id}, please try again.`)
  }

  const img_blob = await convertBuffer2BlobURL(buff)
  post.post.uri = img_blob

  const name_res = await fetch(`http://localhost:3000/api/userName?userID=${post.post.author}`)
  const { username } = await name_res.json()

  post.post.author_name = username

  return post.post
}
