//This is going to be my kind of hello world document... I want to get a string onto this nfc card

const { NFC, KEY_TYPE_A, KEY_TYPE_B } = require('nfc-pcsc');

const nfc = new NFC();

//Paramaters for application
const acceptedCardType = "TAG_ISO_14443_3"
const test_block_num = 4 //Try to stay out of first sector for testing, don't want to screw up the first block
const key_type = KEY_TYPE_B
const key = "FFFFFFFFFFFF" //This is Key B, pretty sure it will work as K A tho too

nfc.on('reader', async reader => {
    console.log(`${reader.reader.name} is ready!`);
    reader.on("card", async card => {
        //Check card type
        if(card.type == acceptedCardType){
            console.log(`Good Card: ${card.type}`);
        }else{
            console.log(`Reader does not accept cards of type: ${card.type}`);
        }

        //This is where we are going to try and authenticate
        try{
            await reader.authenticate(test_block_num, key_type, key)
            console.log("Successfully Authenticated")
        }
        catch(err){
            console.log(err)
        }

        
    })

    reader.on("error", err => {
        console.log(`An error occurred ${err}`)
    })
})

