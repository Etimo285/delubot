const { Client, EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Component } = require('discord.js');
const nekosearcherFactory = require('./neko-searcher/nekosearcherFactory')

class Module {
  constructor() {
    this.name = 'Delubot';
    this.version = '1.0.0';

    this.commands = [
      new SlashCommandBuilder()
      .setName('neko')
      .setDescription('Cherche un anime sur Neko-Sama')
      .addStringOption(option => 
        option
          .setName('animetosearch')
          .setDescription('L\'anime à chercher ')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('version')
          .setDescription('La version de l\'anime (Par défaut sur VOSTFR)')
          .addChoices(
            { name: 'VOSTFR', value: 'anime' },
            { name: 'VF', value: 'anime-vf' },
          )
      )
    ]
  }

  /**
   * 
   * @param {Client} client 
   */
  launch(client) {
    client.on("interactionCreate", (interaction) => {
      if (interaction.isChatInputCommand()) {
        switch (interaction.commandName) {
          case 'neko':
            this.nekoSearch(interaction, interaction.channel)
            break;
          default:
            break;
        }
      } else if (interaction.isButton()) {
        switch (interaction.customId) {
          case 'previous':
            
            break;
          case 'next':
          
          break;
          default:
            break;
        }
      }
    })
  }

  ping(interaction) {
    const user = interaction.user;
    const url = 'https://tenor.com/view/pong-video-game-atari-tennis-70s-gif-16894549';
    const gif = 'https://c.tenor.com/2gyJVMt_L6wAAAAC/pong-video-game.gif';
    interaction.reply({
      embeds: [
        this.MessageEmbedBuilder(user, gif, 'ping', url, 'pong !', gif, 'totoboto4 ping services')
      ]
    });
  }

  async nekoSearch(interaction, channel) {
    const searchInput = interaction.options.get('animetosearch').value
    let animeVersion = "VOSTFR"
    if (interaction.options.get('version') !== null) {
      animeVersion = interaction.options.get('version').value
    }
    interaction.reply(`Recherche ${searchInput} ${animeVersion} ...`)
    const nekosearcher = nekosearcherFactory.create()

    await nekosearcher.init(true, 10, animeVersion === "VOSTFR" ? "anime" : "anime-vf")
    await nekosearcher.search(searchInput)
    const infos = await nekosearcher.getResults()

    const embeds = []

    for (let info of infos) {
      embeds.push(
        this.MessageEmbedBuilder(
          interaction.user,
          "https://pbs.twimg.com/profile_images/1243051218311827456/-JN_faKB_400x400.jpg",
          `${info.title} ${animeVersion}`,
          info.link,
          `Recherche originale : ${searchInput} \n Lien : ${info.link}`,
          info.cover,
          `${info.year} - ${info.episodes}`
        )
      )
    }

    const previousButton = new ButtonBuilder()
			.setCustomId('previous')
			.setEmoji("◀️")
			.setStyle(ButtonStyle.Secondary)
    const nextButton = new ButtonBuilder()
      .setCustomId('next')
      .setEmoji("▶️")
      .setStyle(ButtonStyle.Secondary)
    
    if (!infos.length)
      interaction.editReply("Aucun résultats ∩┐\(◣_◢\)┌∩┐")
    else
      interaction.editReply({
        embeds: [embeds[0]],
        components: [
          new ActionRowBuilder()
            .addComponents(previousButton, nextButton)
        ]
    })

    nekosearcher.close()
  }

  MessageEmbedBuilder(author, thumbnail, title, url, description, image, footer) {
    return new EmbedBuilder()
      .setColor('Navy')
      .setAuthor({
        name: author.username
      })
      .setThumbnail(thumbnail)
      .setTitle(title)
      .setURL(url)
      .setDescription(description)
      .setImage(image)
      .setFooter({
        text: footer
      })
      .setTimestamp(new Date());
  }
}

module.exports = new Module()
