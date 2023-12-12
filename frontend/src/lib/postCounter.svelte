<script>
    import { onMount } from "svelte";


  let postCounter
  $: postCounter

  const updatePostCounter = async () => {
    try {
      const response = await fetch('/api/getPostCount');
      const { postCount } = await response.json();

      if (postCount) {
        postCounter = postCount.toString()
      }
    } catch (error) {
      console.error('Error fetching post count:', error);
    }

  };

  onMount(() => {
    // Initial update and set interval for periodic updates
    updatePostCounter();
    setInterval(updatePostCounter, 10000);
  })
</script>

<div class="post-counter">
  {#if postCounter !== undefined}
    <p>Posts: {postCounter}</p>
  {/if}
</div>

<style>
</style>
