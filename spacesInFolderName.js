const spacesInFolderName = (str_input) =>{
  console.log(str_input.search(" "))
  if(str_input.search(" ") == -1){
    return false;
  }
  return true;
}

module.exports = {spacesInFolderName}
