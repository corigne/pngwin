<script>
    import SignUpModal from "$lib/verifyModal.svelte";
    import OTPModal from "$lib/otpModal.svelte";
    import { onMount } from "svelte";
    import {
        Modal,
        ModalBody,
        ModalFooter,
        ModalHeader,
        Button,
        Input,
        InputGroup,
        Form,
    } from "sveltestrap";
    import { logged_in, user } from '$lib/stores'
    import { jwtDecode } from 'jwt-decode'

    let open = false;
    let username = '';
    let inputField;
    let rememberMe = false;
    let otpRequired = false;
    let otp = '';
    let sessionuuid = '';

    const toggle = () => (open = !open);

    const automaticLogin = async () => {
        //check if cookie exists and await fetch login using jwt token
        if (document.cookie.split(';').some((item) => item.trim().startsWith('jwt='))) {
            const jwt = document.cookie.split(';').find((t) => t.trim().startsWith('jwt=')).split('=')[1]
            const { userid, role, exp } = jwtDecode(jwt)

            // expire token if exp passed, no fetch req
            if (Date.now() >= exp * 1000) {
              console.log("Token expired, logging you out.")
              handleLogout()
              document.cookie = ""
              logged_in.set(false)
            }

            const gotName = await fetch(`/api/userName?userID=${userid}`)
            const { username } = await gotName.json()

            if(!username)
              return alert("Auto-login failed, please try logging in manually.")

            const res = await fetch('/api/login',
                {
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
                console.log($user)
                return;
            }
        }

        console.log("Unable to log in automatically, opening login modal.")
        toggle()
    }

    const manualLogin = async () => {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, remembered: rememberMe })
        });

        const data = await res.json();

        if (data.login && data.otp_required) {
            // OTP is required
            otpRequired = true;
            sessionuuid = data.session_id;
        }
        else {
            alert("Login failed, please try again.\n" + data.error)
        }
    }

    const otpLogin = async () => {
        const res = await fetch('/api/verifyOTP', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ OTP: otp, session_id: sessionuuid })
        });

        const data = await res.json();

        if (data.valid) {
            // Login successful
            if (rememberMe) {
                //set cookie with jwt token with expiration of 30 days
                document.cookie = `jwt=${data.token}; expires=${new Date(Date.now() + 2592000000)}; path=/`;
            }
            else{
                //set cookie with jwt token with expiration of 1 day
                document.cookie = `jwt=${data.token}; expires=${new Date(Date.now() + 86400000)}; path=/`;
            }
            const { userid, role } = jwtDecode(data.token)
            logged_in.set(true)
            user.set({
              name: username,
              id: userid,
              role: role
            })
            console.log($user)
            toggle();
        }
        else {
            // Login failed
            alert("Login Failed! Please try again.");
        }
    }

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        await manualLogin();
    }
    const handleOTPSubmit = async (event) => {
        event.preventDefault();
        await otpLogin();
        otpRequired = false;
    }

    onMount(() => {
        // Focus on username input
        if (open && inputField) {
            inputField.focus();
        }
    });
</script>

<Button class="login" color="warning" on:click={automaticLogin}>Login</Button>
<div class="LogInModal">
    {#if otpRequired}
    <Modal isOpen={open} backdrop = {false} toggle>
        <Form on:submit={handleOTPSubmit}>
          <ModalHeader {toggle}>Enter OTP</ModalHeader>
          <ModalBody>
            <h6>OTP</h6>
            <InputGroup>
              <Input bind:value={otp} placeholder= "Enter OTP" />
            </InputGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" type="submit">
            Submit
            </Button>
            <Button color="secondary" on:click={toggle}>
              Cancel
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    {:else}
        <Modal isOpen={open} backdrop={false} {toggle}>
              <ModalHeader {toggle}>Login</ModalHeader>
              <ModalBody>
                  <Form on:submit={handleFormSubmit}>
                      <h6>Username</h6>
                      <InputGroup>
                          <Input bind:value={username} placeholder="Ex. _bbygworlpngwin" />
                      </InputGroup>

                      <label>
                          <input type="checkbox" bind:checked={rememberMe} />
                          Remember Me
                      </label>
                  </Form>
              </ModalBody>
              <ModalFooter>
                  <SignUpModal/>
                  <Button color="warning" type="submit" on:click={handleFormSubmit}>Login</Button>
                  <Button color="secondary" on:click={toggle}>Cancel</Button>
              </ModalFooter>
        </Modal>
    {/if}
</div>
