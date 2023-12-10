<script lang="js">
    import {
        Button,
    } from "sveltestrap";
    let input;
    let container;
    let image;
    let placeholder;
    let showImage = false;

    function onChange() {
        const file = input.files[0];

        if (file) {
            showImage = true;

            const reader = new FileReader();
            reader.addEventListener("load", function () {
                image.setAttribute("src", reader.result);
            });
            reader.readAsDataURL(file);

            return;
        }
        showImage = false;
    }
</script>

<div id="Page" style="display:inline-flex">

<div class="NavBar">
    <div class=" py-0">
        <figure class="logo">
            <img src="/pngwin-modified.png" alt="pngwin logo" />
            <figcaption class="logo_title">PNG.WIN</figcaption>
        </figure>
    </div>

    <div class="buttons">
        <Button class="myauto" size="lg">Home</Button>
        <Button size="lg">Posts</Button>
        <Button size="lg">Collections</Button>
        <Button size="lg">Settings</Button>
    </div>
</div>




<!-- Uploaded image area-->

<div class="imageArea " >
   <div bind:this={container}>
        {#if showImage}
            <img id="previewImage" bind:this={image} src="" alt="Preview" />
        {:else}
            <span bind:this={placeholder}>Image Preview</span>
        {/if}
</div>
        <div class="FormInput">
        <input bind:this={input} on:change={onChange} type="file" />
    </div>

<div style="margin-left: 45%">
    <input placeholder="Type a tag here" />
    <span>Current Tags (0)</span>
</div>

    <div style="margin-left: 80%">
        <Button style="text-align:end" size="lg">Post</Button>
    </div>
</div>
</div>
<style>
    :global(body) {
        background-color: #949494;
    }
    img {
        width: 35%;
        height: 35%;
        margin-left: 5%;
    }
    .logo_title {
        font-family: Krungthep;
        font-size: 2vw;
    }
    .NavBar {
        width: 20%;
        align-items: center;
    }
    .buttons {
        align-items: center;
        width: 10%;
    }
    .FormInput {
        display: inline-block;
        width: 20%;
    }

    .imageArea {
        width: 80%;
        margin-left: 0%;
        display: inline-block;
    }

    #previewImage {
        width: 35%;
        height: 35%;
    }
</style>
