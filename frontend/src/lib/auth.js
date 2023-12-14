import { logged_in, user } from "$lib/stores"
import { jwtDecode } from "jwt-decode"

export const handleLogout = async () => {
  if (document.cookie.split(';').some((item) => item.trim().startsWith('jwt='))) {

    const jwt = document.cookie.split(';').find((t) => t.trim().startsWith('jwt=')).split('=')[1]

    console.log(jwt)

    const result = await fetch('/api/logout', {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    })
    const json_res = await result.json()

    console.log(result)
    console.log(json_res)
  }
  document.cookie = `jwt=; expires=${new Date(Date.now() - 1 )}; path=/`;
  logged_in.set(false)
  user.set(null)
}

export const automaticallyLogin = async () => {
  //check for cookie
  if (document.cookie.split(';').some((item) => item.trim().startsWith('jwt='))) {

    const jwt = document.cookie.split(';').find((t) => t.trim().startsWith('jwt=')).split('=')[1]
    const { userid, session_id, role, exp } = jwtDecode(jwt)

    // expire token if exp passed, no fetch req
    if (Date.now() >= exp * 1000) {
      console.log("Token expired, logging you out.")
      handleLogout()
    }

    const gotName = await fetch(`/api/userName?userID=${userid}`)

    if(!gotName){
      return alert("Error in automatically logging in, please try logging in manually.")
    }

    const { username } = await gotName.json()

    if(!username)
      return alert("Login failed, username not found.")

    // otherwise fetch for login
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        jwt: jwt
      })
    })
    const data = await res.json();

    if (data.login) {
      logged_in.set(true)
      user.set({
        name: username,
        id: userid,
        role: role
      })
      return;
    }
    else {
      alert("Login Failed! \n" + data.error)
    }
    logged_in.set(true)
  }
  else {
    console.log("Not logged in.")
  }
}
