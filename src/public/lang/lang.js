const languageDefinition = [
    {
        page: 'index',
        changeLanguageCallback: () => {},
        strings:
        {
            '#IdentificationTitle': {
                'en': '> IDENTIFICATION',
                'es': '> IDENTIFICACIÓN',
                'pt-br': '> IDENTIFICAÇAO'
            },
            '#PleaseSignIn': {
                'en': 'Please identify using your Discord account.',
                'es': 'Por favor identificate usando tu cuenta de Discord.',
                'pt-br': 'Por favor, identifique-se usando sua conta do Discord.'
            },
            '#loginButton': {
                'en': 'Login with Discord.',
                'es': 'Iniciar sesión con Discord.',
                'pt-br': 'Entrar com Discord.'
            }
        }
    },
    {
        page: 'schedulelisttable',
        changeLanguageCallback: () => {},
        strings: {
            'goToScheduleButton': {
                'en': `Schedule`,
                'es': 'Horario',
                'pt-br': 'Horario'
            },
            'emptyTable': {
                'en': `No matches found`,
                'es': 'No se encontraron horarios',
                'pt-br': 'Nenhum horário encontrado'
            }
        }
    },
    {
        page: 'schedulelist',
        changeLanguageCallback: () => {
            if (!isLoading){
                table.ajax.reload(null, false);
            }
        },
        strings: {
            '#ScheduleTitle': {
                'en': `> YOUR TEAM'S SCHEDULE`,
                'es': '> EL HORARIO DE TU EQUIPO',
                'pt-br': '> AGENDA DA SUA EQUIPE'
            },
            '#ScheduleTitleLeagueOfficial': {
                'en': `> ALL TEAM'S SCHEDULE`,
                'es': '> HORARIO DE TODOS LOS EQUIPOS',
                'pt-br': '> PROGRAMAÇÃO DE TODAS AS EQUIPES'
            },
            '#UpcomingText': {
                'en': `Upcoming`,
                'es': 'Próximos',
                'pt-br': 'Próximos'
            },
            '#PreviousText': {
                'en': `Previous`,
                'es': 'Previos',
                'pt-br': 'Anterior'
            },
            '#tblMatchName': {
                'en': `Name`,
                'es': 'Nombre',
                'pt-br': 'Nome'
            },
            '#tblTeam1': {
                'en': `Team 1`,
                'es': 'Equipo 1',
                'pt-br': 'Equipe 1'
            },
            '#tblTeam2': {
                'en': `Team 2`,
                'es': 'Equipo 2',
                'pt-br': 'Equipe 2'
            },
            '#tblStart': {
                'en': `Start`,
                'es': 'Comienzo',
                'pt-br': 'Início'
            },
            '#tblEnd': {
                'en': `End`,
                'es': 'Final',
                'pt-br': 'Fim'
            },
            '#tblMatchTime': {
                'en': `-`,
                'es': '-',
                'pt-br': '-'
            },
            '#tblLink': {
                'en': `Link`,
                'es': 'Link',
                'pt-br': 'Link'
            },
            '.dt-search > label': {
                'en': `Search`,
                'es': 'Búsqueda',
                'pt-br': 'Procurar'
            }
        }
    },
    {
        page: 'schedule',
        changeLanguageCallback: () => {},
        strings: {
            '#ParticipantsTitle': {
                'en': `> PARTICIPANTS`,
                'es': '> PARTICIPANTES',
                'pt-br': '> PARTICIPANTES'
            },
            '#EmptyParticipantList': {
                'en': `No one has filled the schedule`,
                'es': 'Nadie ha llenado el horario',
                'pt-br': 'Ninguém preencheu a agenda'
            },
            '#ScheduleTitle': {
                'en': `> SCHEDULE`,
                'es': '> HORARIO',
                'pt-br': '> AGENDA'
            },
            '#MeTab': {
                'en': `ME`,
                'es': 'YO',
                'pt-br': 'EU'
            },
            '#TeamTab': {
                'en': `TEAM`,
                'es': 'EQUIPO',
                'pt-br': 'EQUIPE'
            },
            '#TimeZoneText': {
                'en': `Your time zone`,
                'es': 'Tu zona horaria',
                'pt-br': 'Seu fuso horário'
            }
        }
    },
    {
        page: 'creatematch',
        strings: {
            '#CreateMatchTitles': {
                'en': `> CREATE NEW MATCHES`,
                'es': '> CREAR NUEVOS HORARIOS',
                'pt-br': 'CRIAR NOVOS HORÁRIOS'
            },
            '#team1Lbl': {
                'en': `Team 1`,
                'es': 'Equipo 1',
                'pt-br': 'Equipe 1'
            },
            '#team2Lbl': {
                'en': `Team 2`,
                'es': 'Equipo 2',
                'pt-br': 'Equipe 2'
            },
            '#MatchNameLabel': {
                'en': `Match name`,
                'es': 'Nombre de horario',
                'pt-br': 'Nome da horario'
            },
            '.SelectTeamOption': {
                'en': `SELECT TEAM`,
                'es': 'SELECCIONE EQUIPO',
                'pt-br': 'SELECIONAR EQUIPE'
            },
            '#btnAddMatchToList': {
                'en': `Add to match list`,
                'es': 'Agregar a lista de horarios',
                'pt-br': 'Adicionar à lista de horários'
            },
            '#MatchListTitles': {
                'en': `> MATCH SCHEDULES`,
                'es': '> LISTA DE HORARIOS',
                'pt-br': '> LISTA DE HORÁRIOS'
            },
            '#StartDateLabel': {
                'en': `Start date`,
                'es': 'Fecha inicial',
                'pt-br': 'Data de início'
            },
            '#EndDateLabel': {
                'en': `End date`,
                'es': 'Fecha final',
                'pt-br': 'Data de término'
            },
            '#TimeZoneLabel': {
                'en': `Time zone`,
                'es': 'Zona horaria',
                'pt-br': 'Fuso horário'
            },
            '#tblTitleName': {
                'en': `Name`,
                'es': 'Nombre',
                'pt-br': 'Nome'
            },
            '#tblTitleTeam1': {
                'en': `Team 1`,
                'es': 'Equipo 1',
                'pt-br': 'Equipe 1'
            },
            '#tblTitleTeam2': {
                'en': `Team 2`,
                'es': 'Equipo 2',
                'pt-br': 'Equipe 2'
            },
            '#tblTitleActions': {
                'en': `Actions`,
                'es': 'Acciones',
                'pt-br': 'Ações'
            },
            '#noMatchesToSchedule': {
                'en': `There's no matches to schedule`,
                'es': `No hay horarios que programar`,
                'pt-br': `Não há horários para agendar`
            },
            '#btnProcessMatches': {
                'en': `Schedule matches`,
                'es': `Programar horarios`,
                'pt-br': `Agendar horários`
            },
            '#createdMatchURLS': {
                'en': `> MATCH URLS`,
                'es': `> URLS DE HORARIOS`,
                'pt-br': `URLS DE HORÁRIOS`
            },
            '#NoMatchUrlsText': {
                'en': `There's no matches URLs`,
                'es': `No hay URLs de horarios`,
                'pt-br': `Não há URLs de horários`
            }
        }
    },
    {
        page: '*',
        changeLanguageCallback: () => {},
        strings: {
            '#LanguageMenu': {
                'en': `Language`,
                'es': 'Lenguaje',
                'pt-br': 'Idioma'
            },
            '#LogoutButton': {
                'en': `Logout`,
                'es': 'Cerrar sesión',
                'pt-br': 'Sair'
            },
            '#LogoutButtonMenu': {
                'en': `Logout`,
                'es': 'Cerrar sesión',
                'pt-br': 'Sair'
            },
            '#optionBtn': {
                'en': `Options`,
                'es': 'Opciones',
                'pt-br': 'Opções'
            },
            '#GotoTitle': {
                'en': `Go to`,
                'es': 'Ir a',
                'pt-br': 'Vá para'
            },
            '#ScheduleListButton': {
                'en': `Schedule list`,
                'es': 'Lista de horarios',
                'pt-br': 'Lista de programação'
            },
            '#CreateMatchButton': {
                'en': `Create match`,
                'es': 'Crear horario',
                'pt-br': 'Criar horário'
            },
            '#LanguageTitle': {
                'en': `Language`,
                'es': 'Lenguaje',
                'pt-br': 'Idioma'
            },
            '#Footer1': {
                'en': `We use only the necessary cookies and we don't track our users.`,
                'es': 'Sólo usamos las cookies necesarias y no rastreamos a nuestros usuarios.',
                'pt-br': 'Usamos apenas os cookies necessários e não rastreamos nossos usuários.'
            },
            '#Footer2': {
                'en': `When2Bloon was made by @Xixo in 2024.`,
                'es': 'When2Bloon fue creado por @Xixo en 2024.',
                'pt-br': 'When2Bloon foi criado por @Xixo em 2024.'
            },
            '#Footer3': {
                'en': `You can support bloon's development on <a href="https://ko-fi.com/bloon"> ko-fi.com</a>`,
                'es': 'Puedes apoyar el desarrollo de bloon en <a href="https://ko-fi.com/bloon"> ko-fi.com</a>',
                'pt-br': 'Você pode apoiar o desenvolvimento do bloon em <a href="https://ko-fi.com/bloon"> ko-fi.com</a>'
            },
            '#Footer4': {
                'en': `Special thanks to Cross, CoolTurtle, Mancuba, PBEgood, Polybius, Thisisnotatag & Mattbatt56`,
                'es': 'Agradecimientos especiales a Cross, CoolTurtle, Mancuba, PBEgood Polybius, Thisisnotatag y Mattbatt56',
                'pt-br': 'Agradecimentos especiais a Cross, CoolTurtle, Mancuba, PBEgood, Polybius, Thisisnotatag e Mattbatt56'
            },
        }
    }

]
