const { EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const nekosearcherFactory = require('./neko-searcher/nekosearcherFactory')
const { genres } = require('./neko-searcher/nekosearcher.json')

class Module {
  constructor () {
    this.name = 'Delubot'
    this.version = '1.0.0'
    this.prefix = 'delu'

    this.commands = [
      new SlashCommandBuilder()
        .setName(`${this.prefix}-nekosearch`)
        .setDescription('Cherche un anime sur Neko-Sama')
        .addStringOption(option =>
          option
            .setName('animetosearch')
            .setDescription('L\'anime à chercher')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('version')
            .setDescription('La version de l\'anime (Par défaut sur VOSTFR)')
            .addChoices(
              { name: 'VOSTFR', value: 'anime' },
              { name: 'VF', value: 'anime-vf' }
            )
        )
    ]
  }

  /**
   *
   * @param {Client} client
   */
  launch (client) {
    client.on('interactionCreate', async (interaction) => {
      if (interaction.isChatInputCommand()) {
        switch (interaction.commandName) {
          case `${this.prefix}-nekosearch`:
            this.nekoSearch(interaction)
            break
          default:
            break
        }
      } else if (interaction.isButton()) {
        interaction.deferUpdate()
      }
    })
  }

  async nekoSearch (interaction) {
    const searchInput = interaction.options.get('animetosearch').value
    let animeVersion = 'VOSTFR'
    if (interaction.options.get('version') !== null) {
      animeVersion = interaction.options.get('version').value === 'anime-vf' ? 'VF' : 'VOSTFR'
    }
    interaction.reply(`Recherche ${searchInput} ${animeVersion} ...`)
    const nekosearcher = nekosearcherFactory.create()
    await nekosearcher.init(true, 10, animeVersion === 'VOSTFR' ? 'anime' : 'anime-vf')
    await nekosearcher.search(searchInput)
    const infos = await nekosearcher.getResults({ isSearched: true })

    const embeds = []
    let position = 0

    for (const info of infos) {
      embeds.push(
        this.MessageEmbedBuilder(
          'Navy',
          interaction.user,
          'https://pbs.twimg.com/profile_images/1243051218311827456/-JN_faKB_400x400.jpg',
          `${info.title} ${animeVersion}`,
          info.link,
          `Recherche originale : ${searchInput} \n Lien : ${info.link} \n Score : ${info.score} / 5`,
          info.cover,
          `Page ${infos.indexOf(info) + 1}/${infos.length} - ${info.year} - ${info.episodes}`
        )
      )
    }

    const previousButton = new ButtonBuilder()
      .setCustomId('previous')
      .setEmoji('◀️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(position === 0)
    const nextButton = new ButtonBuilder()
      .setCustomId('next')
      .setEmoji('▶️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(position === embeds.length - 1)
    const linkButton = new ButtonBuilder()
      .setLabel('Regarder sur Neko-Sama')
      .setStyle(ButtonStyle.Link)
    const row = new ActionRowBuilder()
      .addComponents(previousButton, nextButton, linkButton)

    if (!infos.length) { interaction.editReply(`Aucun résultats pour ${searchInput}.`) } else {
      linkButton
        .setURL(infos[0].link)
      await refresh()
    }

    async function refresh () {
      const response = await interaction.editReply({
        content: '',
        embeds: [embeds[position]],
        components: [row]
      })

      // const filter = i => i.user.id === interaction.user.id
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
          .setDisabled(position === embeds.length - 1)
        previousButton
          .setDisabled(position === 0)
        linkButton
          .setURL(infos[position].link)

        await interaction.editReply({
          embeds: [embeds[position]],
          components: [row]
        })

        refresh()
      } catch (e) {
        await interaction.editReply({
          components: []
        })
      }
    }
    nekosearcher.close()
  }

  MessageEmbedBuilder (color, author, thumbnail, title, url, description, image, footer) {
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
      .setTimestamp(new Date())
  }
}

module.exports = new Module()
