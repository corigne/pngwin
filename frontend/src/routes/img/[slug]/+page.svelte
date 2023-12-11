<script>
  import {
    Button, Card, CardBody
  } from 'sveltestrap';

  import { convertBuffer2BlobURL } from '$lib/convert'
  import { logged_in } from '$lib/stores'

  /** @type {import('./$types').PageData} */
	export let data

  const downloadBlob = (blob, name = 'file.txt') => {
    // Create a link element
    const link = document.createElement("a");
    link.href = blob;
    link.download = name;
    document.body.appendChild(link);

    link.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      })
    );
    // Remove link from body
    document.body.removeChild(link);
  }

  const openImageInTab = async () => {
    const res = await fetch(`http://localhost:3000/api/getImage?imageID=${data.id}&fullsize=true`)
    const img = await res.json()

    if(!img){
      return alert("We're sorry, your download failed to start. Please try again!")
    }

    const buff = Uint8Array.from([...img.buffer.data])
    const blob = await convertBuffer2BlobURL(buff)

    let w = window.open(blob)
  }

  const downloadImage = async () => {
    const res = await fetch(`http://localhost:3000/api/getImage?imageID=${data.id}&fullsize=true`)
    const img = await res.json()

    if(!img){
      return alert("We're sorry, your download failed to start. Please try again!")
    }

    const buff = Uint8Array.from([...img.buffer.data])
    const blob = await convertBuffer2BlobURL(buff)

    downloadBlob(blob, `${data.id}_${data.tags.join('-')}.png`)
  }

  const tryVote= async (liked) => {


  }

</script>

<main class="main-section">
  <section class="sidebar">
    <Card>
      <div class="info-card">
        <h3>Information</h3>
        <p>Tags: {data.tags}</p>
        <p>Poster: <b>{data.author_name}</b> ({data.author})</p>
        <Button on:click={openImageInTab}>View Full-size Image</Button>
        <Button on:click={downloadImage}>Download as .png</Button>
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
    display: flex;
    padding-top: 1vw;
    gap: 2ex;
  }

  .sidebar {
    flex: 0 0 20%; /* Adjust width as needed */
    background: #f0f0f0;
    padding: 1ex;

    display: flex;
    flex-direction: column;
    gap: 1ex;
  }

  .info-card {
    padding: 1ex;
    flex-grow: 1;
    height: auto;

    display: flex;
    flex-direction: column;
    justify-content: start;
    gap: 1ex;
  }

  .image-section {
    flex: 1;
    background: #f0f0f0;
    padding: 1ex;

    display:flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-between;
    gap: 1ex;
  }

  .image-container {
    padding: 0;
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
      flex-direction: column;
    }
  }

  @media (min-width: 768px) {
  }

</style>
