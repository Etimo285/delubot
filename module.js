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
      ),
      new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!')
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
          case 'ping':
            this.ping(interaction)
            break;
          case 'neko':
            this.nekoSearch(interaction)
            break;
          default:
            break;
        }
      } else if (interaction.isButton()) {
        interaction.deferUpdate()
      }
    })
  }

  async ping(interaction) {
    const user = interaction.user;
    const url = 'https://tenor.com/view/pong-video-game-atari-tennis-70s-gif-16894549'
    const gif = 'https://c.tenor.com/2gyJVMt_L6wAAAAC/pong-video-game.gif'
    const gif0 = 'https://media.tenor.com/ZBVQpHH9YfkAAAAC/oh-no-joseph-joestar.gif'
    const gif1 = 'https://media.tenor.com/p45pEdZ3j8MAAAAC/skeleton-waiting-for-you.gif'
    
    const pang = new ButtonBuilder()
			.setCustomId('pang')
			.setLabel('Pang ! !')
			.setStyle(ButtonStyle.Danger)
    
    const row = new ActionRowBuilder()
      .addComponents(pang)
    
    const response = await interaction.reply({
      embeds: [
        this.MessageEmbedBuilder(user, user.avatarURL(), 'ping', url, 'pong !', gif, 'totoboto4 ping services')
      ],
      components: [row]
    })

    const filter = i => i.user.id === interaction.user.id;
    try {
      const panged = await response.awaitMessageComponent({ filter, time: 60000 });

      if (panged.customId === 'pang') {
        await interaction.editReply({
          embeds: [
            this.MessageEmbedBuilder(user, user.avatarURL(), 'pong', url, 'got panged ! !', gif0, `${user.username} pang services !!`)
          ],
          components: []
        });
      }
    } catch (e) {
      await interaction.editReply({
        embeds: [
          this.MessageEmbedBuilder(user, user.avatarURL(), 'Dead Bored', url, 'You so boring, I\'m dead of waiting.', gif1, `${user.username} boring services...`)
        ],
        components: []
      });
    }
  }



  async nekoSearch(interaction) {
    const searchInput = interaction.options.get('animetosearch').value
    let animeVersion = "VOSTFR"
    if (interaction.options.get('version') !== null) {
      animeVersion = interaction.options.get('version').value === "anime-vf" ? "VF" : "VOSTFR"
    }
    interaction.reply(`Recherche ${searchInput} ${animeVersion} ...`)
    const nekosearcher = nekosearcherFactory.create()

    await nekosearcher.init(true, 10, animeVersion === "VOSTFR" ? "anime" : "anime-vf")
    await nekosearcher.search(searchInput)
    const infos = await nekosearcher.getResults()

    const embeds = []
    let position = 0

    for (let info of infos) {
      embeds.push(
        this.MessageEmbedBuilder(
          'Navy',
          interaction.user,
          "https://pbs.twimg.com/profile_images/1243051218311827456/-JN_faKB_400x400.jpg",
          `${info.title} ${animeVersion}`,
          info.link,
          `Recherche originale : ${searchInput} \n Lien : ${info.link}`,
          info.cover,
          `Page ${infos.indexOf(info)+1}/${infos.length} - ${info.year} - ${info.episodes}`
        )
      )
    }

    let previousButton = new ButtonBuilder()
			.setCustomId('previous')
			.setEmoji("◀️")
			.setStyle(ButtonStyle.Secondary)
      .setDisabled(position === 0 ? true : false)
    let nextButton = new ButtonBuilder()
      .setCustomId('next')
      .setEmoji("▶️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(position === embeds.length-1 ? true : false)
    let linkButton = new ButtonBuilder()
      .setLabel('Regarder sur Neko-Sama')
      .setStyle(ButtonStyle.Link)
    const row = new ActionRowBuilder()
      .addComponents(previousButton, nextButton, linkButton)
    
    if (!infos.length)
      interaction.editReply(`Aucun résultats pour ${searchInput}.`)
    else {
      linkButton
        .setURL(infos[0].link)
      await refresh()
    }

    async function refresh() {
      const response = await interaction.editReply({
        content: "",
        embeds: [embeds[position]],
        components: [row]
      })

      //const filter = i => i.user.id === interaction.user.id;
      try {
        const btnPress = await response.awaitMessageComponent({ time: 120000 })

        switch (btnPress.customId) {
          case 'previous':
            position--
            break
          case 'next':
            position++
            break
          default:
            break
        }

        nextButton
            .setDisabled(position === embeds.length-1 ? true : false)
        previousButton
            .setDisabled(position === 0 ? true : false)
        linkButton
            .setURL(infos[position].link)

        await interaction.editReply({
          embeds: [embeds[position]],
          components: [row]
        });

        refresh()

      } catch (e) {
        await interaction.editReply({
          components: []
        })
      }
    }
    
    nekosearcher.close()
  }

  MessageEmbedBuilder(color, author, thumbnail, title, url, description, image, footer) {
    return new EmbedBuilder()
      .setColor(color)
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
