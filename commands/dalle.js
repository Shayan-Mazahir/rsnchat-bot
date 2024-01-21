const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const axios = require('axios');
const log = require('../utils/logger');
const dotenv = require("dotenv")
dotenv.config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dalle")
    .setDescription("Generate dalle Image.")
    .addStringOption((option) => option
        .setName("prompt")
        .setDescription("Provide your prompt")
        .setRequired(true)
    ),

  async execute(interaction) {
    
    await interaction.reply("Generating Image...")
    
    const prompt = interaction.options.getString("prompt");

    try {
      const apiUrl = "https://ai.rnilaweera.ovh/api/v1/user/absolutebeauty";
      const payload = {
        prompt: prompt,
      };
      const apiKey = process.env.API_KEY;
      const headers = {
        Authorization: `Bearer ${apiKey}`,
      };

      const response = await axios.post(apiUrl, payload, { headers: headers });

      const image = response.data.image;
      const imageBuffer = Buffer.from(image, 'base64');
      const attachment = new AttachmentBuilder(imageBuffer, { name: 'image.png' });

      await interaction.editReply({ content: '', files: [attachment] });
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        await interaction.editReply({ content:'Please try again later.' });
        return;
      }
      
      if (error.response && error.response.status === 503) {
        
        await interaction.editReply({ content:'API is unavailable.' });
        return;
      }
      
      log.error(`Error importing or using Dalle: ${error}`);
      await interaction.followUp("An error occurred while using Dalle.");
    }
  },
};