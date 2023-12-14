import { error } from "@sveltejs/kit"

export const load = async ({fetch, params}) => {
  const userid = params.slug
  console.log(userid)
  const res = await fetch(`/api/userProfilePublic?userID=${userid}`)
  const userdata = await res.json()
  if (!userdata.success){
    throw error(404, "User Not Found, Please Try Again")
  }
  return userdata
}