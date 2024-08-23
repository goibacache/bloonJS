const languageDefinition = [
    {
        page: 'index',
        strings:
        {
            IdentificationTitle: {
                'en': '> IDENTIFICATION',
                'es': '> IDENTIFICACIÓN',
                'pg': '> IDENTIFICAÇAO'
            },
            PleaseSignIn: {
                'en': 'Please identify using your Discord account.',
                'es': 'Por favor identificate usando tu cuenta de Discord.',
                'pg': 'Por favor, identifique-se usando sua conta do Discord.'
            },
            loginButton: {
                'en': 'Login with Discord.',
                'es': 'Iniciar sesión con Discord.',
                'pg': 'Entrar com Discord.'
            }
        }
    },
    {
        page: 'schedulelist',
        strings: {
            ScheduleTitle: {
                'en': `> YOUR TEAM'S SCHEDULE`,
                'es': '> EL HORARIO DE TU EQUIPO',
                'pg': '> AGENDA DA SUA EQUIPE'
            },
            ScheduleTitleLeagueOfficial: {
                'en': `> ALL TEAM'S SCHEDULE`,
                'es': '> HORARIO DE TODOS LOS EQUIPOS',
                'pg': '> PROGRAMAÇÃO DE TODAS AS EQUIPES'
            }
        }
    },
    {
        page: 'schedule',
        strings: {
            ScheduleTitle: {
                'en': `> SCHEDULE`,
                'es': '> HORARIO',
                'pg': '> AGENDA'
            },
            MeTab: {
                'en': `ME`,
                'es': 'YO',
                'pg': 'EU'
            },
            TeamTab: {
                'en': `TEAM`,
                'es': 'EQUIPO',
                'pg': 'EQUIPE'
            },
            TimeZoneText: {
                'en': `Your time zone`,
                'es': 'Tu zona horaria',
                'pg': 'Seu fuso horário'
            }
        }
    },
    {
        page: '*',
        strings: {
            LanguageMenu: {
                'en': `Language`,
                'es': 'Lenguaje',
                'pg': 'Idioma'
            },
            LogoutButton: {
                'en': `Logout`,
                'es': 'Cerrar sesión',
                'pg': 'Sair'
            },
            LogoutButtonMenu: {
                'en': `Logout`,
                'es': 'Cerrar sesión',
                'pg': 'Sair'
            },
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
