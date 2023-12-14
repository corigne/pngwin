<script>
    import {
        Button, InputGroup, Label,
    } from "sveltestrap"
    import { handleLogout } from "$lib/auth"
    import Tags from "svelte-tags-input"
    import { goto } from '$app/navigation'
    let input
    let image
    let tags = []
    let showImage = false
    let errorMessage

    const onFileSubmit = () => {
      const file = input.files[0]
      console.log(file)

      if (file) {
        // Check if the selected file is a video
        if (!file.type.startsWith('image/')) {
          errorMessage = "Selected file is not an image. Please choose an image.";
          showImage = false;
          return;
        }
        errorMessage = null;
        showImage = true;

        const reader = new FileReader()
          reader.addEventListener("load", function () {
              image.setAttribute("src", reader.result)
              })
        reader.readAsDataURL(file);

        return;
      }
      showImage = false;
      errorMessage = null;
    }

    const onPostSubmit = async () => {

      if(!document.cookie.split(';').find((t) => t.trim().startsWith('jwt='))){
        alert("Session expired! Please log in again.")
        handleLogout()
        goto('/')
      }
      const jwt = document.cookie.split(';').find((t) => t.trim().startsWith('jwt=')).split('=')[1]

      const form_data = new FormData()
      form_data.append('image', input.files[0])
      form_data.append('tags', JSON.stringify(tags))
      const result = await fetch('/api/postImage', {
        method:"POST",
        headers: {
          'Authorization': `Bearer ${jwt}`
        },
        body: form_data
      })
      const res_json = await result.json()

      console.log(result)
      console.log(res_json)
      console.log(result.status)
      console.log(result.status == 200)
      console.log(result.status === 200)

      if (result.status === 200 && res_json.post_success) {
        console.log("Post success, attempting to redirect!")
        goto(`/img/${res_json.id}`)
      }
    }

    const log = () => {
      console.log(tags)
    }

</script>

<div class="uploader-container" >

  <div class="preview-container">
    {#if showImage}
        <img class="image-preview" bind:this={image} src="" alt="Preview" />
    {:else}
    <h2> Upload Image To Begin </h2>
      {#if errorMessage}
        {errorMessage}
      {/if}
    {/if}
  </div>

  <div class="file-selector">
    <InputGroup>
      <input accept="image/*" bind:this={input} on:change={onFileSubmit} type="file" />
    </InputGroup>
  </div>

  <div class="input-container">
    <Label style="width:100%;">
      Tags:
      <Tags bind:tags={tags} onTagClick={log} onlyUnique="true" placeholder="Type a tag and press enter!"/>
    </Label>
  </div>
  <Button color="warning" size="lg" on:click={onPostSubmit}>Submit Post</Button>

</div>

<style>
  .uploader-container {
    background: #f0f0f0;
    height: 90vh;
    margin-top: 1ex;
    padding: 1em;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-content: center;
    gap: 1ex;
  }

  .file-selector {
    width: auto;
  }

  .preview-container {
    background: #cccccc;
    border: gray solid 1px;
    max-height: 100%;
    overflow: hidden;

    flex-grow: 1;
    padding: 2ex;
    text-align: center;
    display: flex;
    justify-content: center;
    align-content: center;
    align-items: center;
  }

  .image-preview {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .input-container {
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 1ex;
  }

</style>
