<script>
  import { onDestroy, onMount } from 'svelte'
  import { Button, Card, CardBody, CardFooter, CardHeader, CardImg, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Image, Label, Nav, NavItem, NavLink, Navbar, Row } from 'sveltestrap'

  import { search_tags } from '$lib/stores.js'
  import { convertBuffer2BlobURL } from '$lib/convert'
  import { goto } from '$app/navigation'

  let data = {}
  let posts = []
  let sortBy = "Date"
  let sortOrder = "desc"


  // placeholder for the unsubscribe callback
  let subscription_tags

  $: sortOrder, sortBy, search_tags
  $: sortedPosts = [...posts]

  onMount(() => {
    subscription_tags = search_tags.subscribe(update_search)
    if(!$search_tags){
      search_tags.set("")
    }
  })

  onDestroy(() => {
    if(subscription_tags){
      subscription_tags()
    }
    console.log('unsubscribe to search_tags called')
  })


  const update_search = async (value) => {
    console.log("subscribe_tags callback triggered with value:", value);

    const tag_str = [... new Set(value.split(/[,\s]/).filter(Boolean))].join(',')
    console.log(tag_str)

    if(tag_str) {
      data = await fetch(`http://localhost:3000/api/search?tags=${tag_str}`)
      .then((res) => res.json())
      posts = data.posts

    } else {
      data = await fetch(`http://localhost:3000/api/search?tags=`)
      .then((res) => res.json())
      posts = data.posts
    }

    // await Promise.all(posts.map(fetchImage))
    await Promise.all(posts.map((post) => {
          console.log(`Fetching image for post ID: ${post.id}`)
          return fetchImage(post)
          }))

    sortPosts()
  }

  const fetchImage = async (post) => {
    try{
      const res = await fetch(`http://localhost:3000/api/getImage?imageID=${post.id}`)
        .then((res) => res.json())
      if (res.buffer) {
        const buff = Uint8Array.from(res.buffer.data)
        const uri = await convertBuffer2BlobURL(buff)

        const newPost = { ...post, uri: uri }
        posts = [...posts.filter(p => p.id !== newPost.id), newPost]
      }
    }
    catch(err){
      console.error(`Error fetching image for post:`, err)
    }
  }

  const sortPosts = () => {

    if(sortBy === "Date"){
      posts = posts.sort((a, b) => {
        if (sortOrder === 'asc') {
        return new Date(a.date_created) - new Date(b.date_created)
        } else {
        return new Date(b.date_created) - new Date(a.date_created)
        }
      })
    }

    if(sortBy === "Score"){
      posts = posts.sort((a, b) => {
        if (sortOrder === 'asc') {
        return a.score - b.score
        } else {
        return b.score - a.score
        }
      })
    }
  }

  const toggleSortOrder = () => {
    // Toggle between 'asc' and 'desc'
    sortOrder = (sortOrder === 'asc') ? 'desc' : 'asc'

    // Re-sort posts based on the current sort order and field
    sortPosts()
  }

  const changeSortBy = (field) => {
    sortBy = field
    console.log(sortBy)

    // Re-sort posts based on the current sort order and field
    sortPosts()
  }

</script>

<header>

<Nav class="nav">
<Navbar>
    <NavItem>
      <Dropdown nav inNavbar>
        <DropdownToggle nav caret>
          Sort By: {sortBy}
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem on:click={() => changeSortBy('Date')}>Date</DropdownItem>
          <DropdownItem on:click={() => changeSortBy('Score')}>Score</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </NavItem>
    <NavItem>
      <NavLink>
        <Button color="warning" on:click={toggleSortOrder}>
          {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        </Button>
      </NavLink>
    </NavItem>
</Navbar>
</Nav>
</header>


<main >
  {#if sortedPosts.length > 0}
    <Row class="card-row">
      {#each sortedPosts as post}
        <Col sm="12" md="6" lg="4" xl="3" xxl="2" class="mb-3" >
          <Card class="card-container" on:click={goto(`/img/${post.id}`)}>
            <CardImg src={post.uri} alt={`Image tags: ${post.tags}`}/>
            <CardBody >
              <CardFooter class="card-footer">
                ID:{post.id} , Score: {post.score}, Tags: {post.tags}
              </CardFooter>
            </CardBody>
          </Card>
        </Col>
      {/each}
    </Row>
  {:else}

<div class="no-result text-center">
    <Card>
      <CardHeader>
        <h4> No results here! </h4>
      </CardHeader>
      <CardImg src="/404.gif" alt="The dinosaur man with infinite sunglasses."/>
      <CardBody>
        <p> Where are the dinosaurs? </p>
      </CardBody>
    </Card>
</div>
  {/if}
</main>

<style>
  header {
    margin-bottom: 1em
  }

  .no-result {
    margin-top: 1vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>
