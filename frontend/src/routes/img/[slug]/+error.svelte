<script>
	import { page } from '$app/stores';
  import {
    Card, CardHeader, CardImg, CardBody, Image
  } from 'sveltestrap';
</script>

<div class="error text-center">
    <Card>
      <CardHeader>
        <h1>{$page.status}</h1>
        <h2>{$page.error.message}</h2>
      </CardHeader>
      <CardImg src="/404.gif" alt="The dinosaur man with infinite sunglasses."/>
      <CardBody>
        <p> Where are the dinosaurs? </p>
      </CardBody>
    </Card>
</div>

<style>
.error {
  margin-top: 1vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

</style>
