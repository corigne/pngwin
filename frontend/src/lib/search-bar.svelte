<script>
  import {
      Input,
      Form,
      Button,
      Col,
  } from "sveltestrap"
  import { goto } from "$app/navigation"

  let tags = ""

  const search = async () => {
    if(tags){
      tags.split(/[\s,]/)
      console.log(tags)
      await goto('/images')
    }
  }

</script>

<div class="col-9 mx-auto my-2 text-center">
    <Form on:submit={search} class="row" >
      <Col xs="11">
        <Input bind:value={tags} placeholder="Search"/>
      </Col>
      <Col xs="1">
        <Button>Search</Button>
      </Col>
  </Form>
</div>
