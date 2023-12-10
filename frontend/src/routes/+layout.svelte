<script>
  import "bootstrap/dist/css/bootstrap.min.css"
  import '../styles/global.css'
  import Navigation from "../lib/navigation.svelte";
  import { onMount } from 'svelte';
</script>

<Navigation />
<!-- page content -->
<slot></slot>
