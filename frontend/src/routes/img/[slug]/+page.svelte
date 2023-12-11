<script>
  import {
    Button, Card, CardBody, CardFooter, CardHeader, CardImg


  } from 'sveltestrap';

  /** @type {import('./$types').PageData} */
	export let data

  console.log(data)

  const downloadImage = async () => {
    const res = await fetch(`http://localhost:3000/api/getImage?imageID=${data.id}`)
    const img = await res.json()

    if(!img){
      return alert("We're sorry, your download failed to start. Please try again!")
    }

    const buff = Uint8Array.from([...img.buffer.data])
    const uri = await convertBuffer2BlobURL(buff)

    const image = new Image()
    image.src = uri
    const w = window.open("")
    w.document.write(image.outerHTML)
  }

</script>

<main class="main-section">
  <section class="sidebar">
    <Card>
      <div class="info-card">
        <h3>Information</h3>
        <p>Tags: {data.tags}</p>
        <p>Author: {data.author}</p>
        <Button on:click={downloadImage}>Download</Button>
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
            <Button>Like</Button>
            <Button>Dislike</Button>
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
    gap: 1ex;
  }

  .info-card {
    padding: 1ex;
    flex-grow: 1;
    height: auto;
  }

  .image-section {
    flex-grow: 1;
    background: #f0f0f0;
    padding: 1ex;

    display:flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-between;
    gap: 1ex;
  }

  .image-container {
    border: #666666 solid 2px;
    height: auto;
    padding: 0;
  }

  .voting-section {
    width: 100%;
    gap: 1ex;
  }


  .comments-section {
    margin-top: 1ex;
  }

  /* Add your additional styles here */
</style>
