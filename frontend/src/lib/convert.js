const convertBuffer2BlobURL = async (imgBuffer) => {
  try{
    const blob = new Blob([imgBuffer], {type: 'image/png'})
    const blobURL = URL.createObjectURL(blob)
    return blobURL
  }
  catch(err){
    console.error("Error converting to blob: ", err)
  }
}

export { convertBuffer2BlobURL }
