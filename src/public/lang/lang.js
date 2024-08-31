const languageDefinition = [
    {
        page: 'index',
        strings:
        {
            '#IdentificationTitle': {
                'en': '> IDENTIFICATION',
                'es': '> IDENTIFICACIÓN',
                'pg': '> IDENTIFICAÇAO'
            },
            '#PleaseSignIn': {
                'en': 'Please identify using your Discord account.',
                'es': 'Por favor identificate usando tu cuenta de Discord.',
                'pg': 'Por favor, identifique-se usando sua conta do Discord.'
            },
            '#loginButton': {
                'en': 'Login with Discord.',
                'es': 'Iniciar sesión con Discord.',
                'pg': 'Entrar com Discord.'
            }
        }
    },
    {
        page: 'schedulelist',
        strings: {
            '#ScheduleTitle': {
                'en': `> YOUR TEAM'S SCHEDULE`,
                'es': '> EL HORARIO DE TU EQUIPO',
                'pg': '> AGENDA DA SUA EQUIPE'
            },
            '#ScheduleTitleLeagueOfficial': {
                'en': `> ALL TEAM'S SCHEDULE`,
                'es': '> HORARIO DE TODOS LOS EQUIPOS',
                'pg': '> PROGRAMAÇÃO DE TODAS AS EQUIPES'
            },
            '#UpcomingText': {
                'en': `Upcoming`,
                'es': 'Próximos',
                'pg': 'Próximos'
            },
            '#PreviousText': {
                'en': `Previous`,
                'es': 'Previos',
                'pg': 'Anterior'
            },
            '#tblMatchName': {
                'en': `Name`,
                'es': 'Nombre',
                'pg': 'Nome'
            },
            '#tblTeam1': {
                'en': `Team 1`,
                'es': 'Equipo 1',
                'pg': 'Equipe 1'
            },
            '#tblTeam2': {
                'en': `Team 2`,
                'es': 'Equipo 2',
                'pg': 'Equipe 2'
            },
            '#tblStart': {
                'en': `Start`,
                'es': 'Comienzo',
                'pg': 'Início'
            },
            '#tblEnd': {
                'en': `End`,
                'es': 'Final',
                'pg': 'Fim'
            },
            '#tblMatchTime': {
                'en': `-`,
                'es': '-',
                'pg': '-'
            },
            '#tblLink': {
                'en': `Link`,
                'es': 'Link',
                'pg': 'Link'
            },
            '.dt-search > label': {
                'en': `Search`,
                'es': 'Búsqueda',
                'pg': 'Procurar'
            }
        }
    },
    {
        page: 'schedule',
        strings: {
            '#ScheduleTitle': {
                'en': `> SCHEDULE`,
                'es': '> HORARIO',
                'pg': '> AGENDA'
            },
            '#MeTab': {
                'en': `ME`,
                'es': 'YO',
                'pg': 'EU'
            },
            '#TeamTab': {
                'en': `TEAM`,
                'es': 'EQUIPO',
                'pg': 'EQUIPE'
            },
            '#TimeZoneText': {
                'en': `Your time zone`,
                'es': 'Tu zona horaria',
                'pg': 'Seu fuso horário'
            }
        }
    },
    {
        page: '*',
        strings: {
            '#LanguageMenu': {
                'en': `Language`,
                'es': 'Lenguaje',
                'pg': 'Idioma'
            },
            '#LogoutButton': {
                'en': `Logout`,
                'es': 'Cerrar sesión',
                'pg': 'Sair'
            },
            '#LogoutButtonMenu': {
                'en': `Logout`,
                'es': 'Cerrar sesión',
                'pg': 'Sair'
            },
            '#optionBtn': {
                'en': `Options`,
                'es': 'Opciones',
                'pg': 'Opções'
            },
            '#GotoTitle': {
                'en': `Go to`,
                'es': 'Ir a',
                'pg': 'Vá para'
            },
            '#ScheduleListButton': {
                'en': `Schedule list`,
                'es': 'Lista de horarios',
                'pg': 'Lista de programação'
            },
            '#CreateMatchButton': {
                'en': `Create match`,
                'es': 'Crear partida',
                'pg': 'Criar partida'
            },
            '#LanguageTitle': {
                'en': `Language`,
                'es': 'Lenguaje',
                'pg': 'Idioma'
            },
            '#Footer1': {
                'en': `We use only the necessary cookies and we don't track our users.`,
                'es': 'Sólo usamos las cookies necesarias y no rastreamos a nuestros usuarios.',
                'pg': 'Usamos apenas os cookies necessários e não rastreamos nossos usuários.'
            },
            '#Footer2': {
                'en': `When2Bloon was made by @Xixo in 2024.`,
                'es': 'When2Bloon fue creado por @Xixo en 2024.',
                'pg': 'When2Bloon foi criado por @Xixo em 2024.'
            },
            '#Footer3': {
                'en': `You can support bloon's development on <a href="https://ko-fi.com/bloon"> ko-fi.com</a>`,
                'es': 'Puedes apoyar el desarrollo de bloon en <a href="https://ko-fi.com/bloon"> ko-fi.com</a>',
                'pg': 'Você pode apoiar o desenvolvimento do bloon em <a href="https://ko-fi.com/bloon"> ko-fi.com</a>'
            },
            '#Footer4': {
                'en': `Special thanks to Cross, CoolTurtle, Mancuba, PBEgood & MattBatt56`,
                'es': 'Agradecimientos especiales a Cross, CoolTurtle, Mancuba, PBEgood y MattBatt56',
                'pg': 'Agradecimentos especiais a Cross, CoolTurtle, Mancuba, PBEgood e MattBatt56'
            },
            // Library used to parse and draw days
            SpaceTime: {
                'en': {},
                'es': {
                    days: {
                        long: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
                        short: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
                    },
                    months: {
                        long: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
                        short: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
                    },
                    ampm: {
                        am: 'am',
                        pm: 'pm'
                    },
                    distance: {
                        past: 'pasado',
                        future: 'futuro',
                        present: 'presente',
                        now: 'ahora',
                        almost: 'casi',
                        over: 'sobre',
                        pastDistance: (value) => `hace ${value}`,
                        futureDistance: (value) => `en ${value}`
                    },
                    units: {
                        second: 'segundo',
                        secondPlural: 'segundos',
                        minute: 'minuto',
                        minutePlural: 'minutos',
                        hour: 'hora',
                        hourPlural: 'horas',
                        day: 'día',
                        dayPlural: 'días',
                        month: 'mes',
                        monthPlural: 'meses',
                        year: 'año',
                        yearPlural: 'años',
                    },
                    useTitleCase: true // automatically in .format()
                },
                'pg': {
                    "days": {
                        "long": ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
                        "short": ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
                    },
                    "months": {
                        "long": ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"],
                        "short": ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
                    },
                    "ampm": {
                        "am": "am",
                        "pm": "pm"
                    },
                    "distance": {
                        "past": "passado",
                        "future": "futuro",
                        "present": "presente",
                        "now": "agora",
                        "almost": "quase",
                        "over": "sobre",
                        "pastDistance": (value) => `há ${value}`,
                        "futureDistance": (value) => `em ${value}`
                    },
                    "units": {
                        "second": "segundo",
                        "secondPlural": "segundos",
                        "minute": "minuto",
                        "minutePlural": "minutos",
                        "hour": "hora",
                        "hourPlural": "horas",
                        "day": "dia",
                        "dayPlural": "dias",
                        "month": "mês",
                        "monthPlural": "meses",
                        "year": "ano",
                        "yearPlural": "anos"
                    },
                    "useTitleCase": true
                }
            },
        }
    }

]
