<script>
  import {
    Button, Card, CardBody, ListGroup, ListGroupItem


  } from 'sveltestrap';

  import { convertBuffer2BlobURL } from '$lib/convert'
  import { logged_in } from '$lib/stores'

  /** @type {import('./$types').PageData} */
	export let data

  const ext = data.mime.split('/')[1]
  console.log(data.uri)

  const downloadBlob = (blob, name) => {
    const anchor = document.createElement('a')
    anchor.setAttribute('download', name)
    anchor.href = blob
    anchor.setAttribute('target', '_blank')
    anchor.click()
    setTimeout(function(){
        document.body.removeChild(anchor);
        window.URL.revokeObjectURL(url);
    }, 100);
  }

  const openImageInTab = async () => {
    const res = await fetch(`http://localhost:3000/api/getImage?imageID=${data.id}&fullsize=true`)
    const img = await res.json()

    if(!img){
      return alert("We're sorry, your download failed to start. Please try again!")
    }

    const buff = Uint8Array.from([...img.buffer.data])
    const blob = await convertBuffer2BlobURL(buff, data.mime)

    let w = window.open(blob)
  }

  const downloadImage = async () => {
    const res = await fetch(`http://localhost:3000/api/getImage?imageID=${data.id}&fullsize=true`)
    const img = await res.json()

    if(!img){
      return alert("We're sorry, your download failed to start. Please try again!")
    }

    const buff = Uint8Array.from([...img.buffer.data])
    const blob = await convertBuffer2BlobURL(buff, data.mime)

    downloadBlob(blob, `${data.id}_${data.tags.join('-')}`)
  }

  const tryVote= async (liked) => {

  }

</script>

<main class="main-section">
  <section class="sidebar">
    <Card>
      <div class="info-card">

        <p><b>Poster:</b> <a href="/user/{data.id}"><b>{data.author_name}</b></a> ({data.author})</p>
        <p><b>Tags:</b></p>
        <div>
        {#each data.tags as tag, i}
          {(i > 0)? ', ':''}<a href="/search?tags={tag}">{tag}</a>
        {/each}
        </div>
        <Button on:click={openImageInTab}>View Full-size Image</Button>
        <Button on:click={downloadImage}>Download as {ext}</Button>
      </div>
    </Card>
  </section>
  <div class="image-section">
      <div class="image-container">
        <img class="card-img-top w-auto" src={data.uri} alt={`Post #${data.id}`} />
      </div>
      <div class="voting-section">
        <Card>
          <CardBody>
            <div>
              <p> Score: {data.score} </p>
            </div>
            {#if $logged_in}
              <Button on:click={tryVote(true)}>Like</Button>
              <Button on:click={tryVote(false)}>Dislike</Button>
            {/if}
          </CardBody>
        </Card>
      </div>
  </div>
</main>

<aside class="comments-section text-center">
  <h3>Comments coming soon...</h3>
  <!-- Add your comment section components here -->
</aside>

<style>

  .main-section {
    padding-top: 1vw;
    gap: 2ex;
  }

  .sidebar {
    float: left;
    clear: left;
    width: 250px;
    min-height: 700px;
    background: #f0f0f0;
    padding: 1ex;
    margin-right: 1ex;

    display: flex;
    flex-direction: column;
    gap: 1ex;
  }

  .info-card {
    padding: 1ex;
    flex-grow: 1;

    display: flex;
    flex-direction: column;
    justify-content: start;
    gap: 1ex;
  }

  .image-section {
    background: #f0f0f0;
    padding: 1ex;
    min-height: 700px;

    display:flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-between;
    gap: 1ex;
  }

  .image-container {
    padding: 0;
    margin: auto;
    border: #666666 solid 2px;
  }

  .image-container img {
    max-width: 100%; /* Make the image fill the container width */
    height: auto; /* Maintain the aspect ratio */
  }

  .voting-section {
    width: 100%;
    gap: 1ex;
  }

  .comments-section {
    margin-top: 1ex;
  }

  /* Styles for screens between 576px and 767.98px (small) */
  @media (max-width: 767.98px) {
    /* Your styles for small screens */
    .main-section {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    .sidebar {
      width: auto;
      margin: 0;
      flex: 100%;
      min-height: 0;
    }
    .image-section {
      flex: 100%;
      min-height: 0;
    }
  }

  @media (min-width: 768px) {
  }

</style>
