//This is going to be my kind of hello world document... I want to get a string onto this nfc card

const { NFC, KEY_TYPE_A, KEY_TYPE_B } = require('nfc-pcsc');

const nfc = new NFC();

//Paramaters for application
const acceptedCardType = "TAG_ISO_14443_3"
const test_block_num = 4 //Try to stay out of first sector for testing, don't want to screw up the first block
const key_type = KEY_TYPE_B
const key = "FFFFFFFFFFFF" //This is Key B, pretty sure it will work as K A tho too
const lower_sector = 3
const upper_sector = 4

async function read_blocks(reader){
    try{
        total_data = Buffer.alloc(16 * (upper_sector - lower_sector + 1) * 3)
        buffer_index = 0
        //Going to have to create a variable to hold data up here
        for(let i = lower_sector; i <= upper_sector; i++){
            await reader.authenticate((i - 1) * 4, key_type, key)
            for(let j = (i - 1) * 4; j < i * 4 - 1; j++){ //This gives us only valid block numbers in a mifare classic 1k card
                data = await reader.read(j, 16, 16)
                //Iterate through each piece of data and add it to the larger object
                for(let m = 0; m < data.length; m ++){
                    total_data[buffer_index] = data[m]
                    buffer_index += 1
                }
            }
        }
        console.log(total_data.toString())
    }catch(err){
        console.log(err)
    }
}

async function write_blocks(reader, string){
    try{
        total_data = Buffer.from(string, "utf-8")
        if(total_data.length > 16 * (upper_sector - lower_sector + 1) * 3){
            throw "Error: Data is too long"
        }
        buffer_index = 0

        for(let i = lower_sector; i <= upper_sector; i++){
            await reader.authenticate((i - 1) * 4, key_type, key)
            for(let j = (i - 1) * 4; j < i * 4 - 1; j++){ //This gives us only valid block numbers in a mifare classic 1k card
                //For every block we want to construct a 16 byte buffer to write to it
                data = Buffer.alloc(16)
                for(let m = 0; m < 16; m ++){
                    if(buffer_index < data.length){
                        data[m] = total_data[buffer_index]
                        buffer_index += 1
                    }else{
                        data[m] = Buffer.alloc(1)
                    }
                }
                await reader.write(j, data, 16);
                console.log("wrote")
            }
        }
        // console.log(total_data.length)
        // //Convert and return the data down here
        // // console.log(total_data)
        // test_data = Buffer.from("Hello World", "utf-8")
        // // console.log(test_data)
    }catch(err){
        console.log(err)
    }
}

// async function read_blocks(blocks, reader){
//     total_data = Buffer.alloc(0)
//     //Going to have to create a variable to hold data up here
//     for(let i = lower_sector; i <= upper_sector; i++){
//         await reader.authenticate((i - 1) * 4, key_type, key)
//         for(let j = (i - 1) * 4; j < i * 4 - 1; j++){ //This gives us only valid block numbers in a mifare classic 1k card
//             data = await reader.read(j, 16, 16)
//             total_data = Buffer.concat([total_data, data])
//         }
//     }
//     //Convert and return the data down here
//     console.log(total_data)
//     test_data = Buffer.from("Hello World", "utf-8")
//     console.log(test_data)
// }


nfc.on('reader', async reader => {
    console.log(`${reader.reader.name} is ready!`);
    reader.on("card", async card => {
        //Check card type
        if(card.type == acceptedCardType){
            console.log(`Good Card: ${card.type}`);
        }else{
            console.log(`Reader does not accept cards of type: ${card.type}`);
            return
        }
        read_blocks(reader)
        // write_blocks(reader, "Hello World!")
    })

    reader.on("error", err => {
        console.log(`An error occurred ${err}`)
    })
})

