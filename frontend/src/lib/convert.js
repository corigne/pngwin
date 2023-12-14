const convertBuffer2BlobURL = async (imgBuffer, mimetype) => {
  try{
    const blob = new Blob([imgBuffer], {type: mimetype})
    const blobURL = URL.createObjectURL(blob)
    return blobURL
  }
  catch(err){
    console.error("Error converting to blob: ", err)
  }
}

export { convertBuffer2BlobURL }
