const fs = require('fs');

class localGuildManager {

    constructor(guildId) {
        this.guildId = guildId;
        this.fileRoute = `./localMemory/serversConfigs/`
        this.guildConfig = `${this.fileRoute}${this.guildId}.guild`
    }

    updateConfigKey = (key, value) => {
        try{
            // Read content of file as json
            const serverConfig = this.getJsonContent();

            // Write data
            serverConfig[key] = value;
            
            // Save data
            this.saveJsonContent(serverConfig);
            
            return true;
        }catch(exception){
            return false;
        }
    }

    getJsonContent = () => {
        if (this.guildId == 0) return;

        if (fs.existsSync(this.guildConfig)){
            const data = fs.readFileSync(this.guildConfig, { encoding: 'utf8', flag: 'r' });
            return JSON.parse(data);
        }else{
            // It's just 0
            return JSON.parse(`{}`);
        }
    }

    saveJsonContent = (data) => {
        if (this.guildId == 0) return;
        
        fs.writeFileSync(this.guildConfig, JSON.stringify(data), {
            encoding: 'utf-8'
        });
    }
}

module.exports = { localGuildManager };