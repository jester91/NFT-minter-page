/** Connect to Moralis server */
const serverUrl = "https://hce1p24bnq1w.usemoralis.com:2053/server";
const appId = "V3FEv8Rm6Z47cmGN38YeHlyR8OABiFXMU85po7OZ";
Moralis.start({ serverUrl, appId });
let user;
/** Add from here down */
async function login() {
  user = Moralis.User.current();
  if (!user) {
   try {
      user = await Moralis.authenticate({ signingMessage: "Hello !",user })
      initApp()
   } catch(error) {
     console.log(error)
   }
  }
  else{
      Moralis.enableWeb3();
      initApp()
  }
}

function initApp()
{
    document.querySelector("#app").style.display="block";
    document.querySelector("#submit_button").onclick=submit;

}
async function submit(){
    //get the img
    const input= document.querySelector("#input_image");
    let data = input.files[0];
    //upload to ipfs
    const imageFile= new Moralis.File(data.name,data);
    await imageFile.saveIPFS();
    let imageHash=imageFile.hash();
    //logging the upload
    console.log(imageHash);
    console.log(imageFile.ipfs());
    //create metadata with img hash and data
    let metadata={
        name:document.querySelector("#input_name").value,
        name:document.querySelector("#input_description").value,
        image:"/ipfs/"+imageHash
    }
    //upload metadata to IPFS
    const jsonFile=new Moralis.File("metadata.json",{base64:btoa(JSON.stringify(metadata))});
    await jsonFile.saveIPFS();
    let metadataHash=jsonFile.hash();
    console.log(metadataHash)
    //upload to rarible with plugin
    let res = await Moralis.Plugins.rarible.lazyMint({
        //chain:'mainnet' to publish it on mainnet
        chain: 'rinkeby',
        userAddress: user.get('ethAddress'),
        tokenType: 'ERC721',
        tokenUri: 'ipfs://' + metadataHash,
        royaltiesAmount: 15, // 0.15% royalty. Optional
    })
    console.log(res);
    document.querySelector('#success_message').innerHTML = 
        `NFT minted. <a href="https://rinkeby.rarible.com/token/${res.data.result.tokenAddress}:${res.data.result.tokenId}" target="_blank">View NFT`; //change rinkeby to mainnet if chain has been changed
    document.querySelector('#success_message').style.display = "block";
    setTimeout(() => {
        document.querySelector('#success_message').style.display = "none";
    }, 5000)
}
login();

// async function logOut() {
//   await Moralis.User.logOut();
//   console.log("logged out");
// }

// document.getElementById("btn-login").onclick = login;
// document.getElementById("btn-logout").onclick = logOut;

/** Useful Resources  */

// https://docs.moralis.io/moralis-server/users/crypto-login
// https://docs.moralis.io/moralis-server/getting-started/quick-start#user
// https://docs.moralis.io/moralis-server/users/crypto-login#metamask

/** Moralis Forum */

// https://forum.moralis.io/