<script>
	import { page } from '$app/stores';
    import { Image } from 'sveltestrap';
</script>

<div class="error">
    <Image src="/404.gif" alt="The dinosaur man with infinite sunglasses."/>
    <h1>{$page.status}</h1>
    <h2>{$page.error.message}</h2>
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
