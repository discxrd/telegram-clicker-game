const marketKey = (import.meta.env.VITE_APP_MARKET || "portugal").toLowerCase();

const markets = {
	portugal: {
		key: "portugal",
		lang: "pt-PT",
		brand: "Volkswagen",
		title: "Bot Telegram Volkswagen",
		botUrl: "https://t.me/vqminerbot",
		subscriptionUrl: "https://t.me/+0BlpnmHFCrhjNDUy",
		subscriptionTitle: "Especialista em Trading 🇵🇹",
		assetsPath: "/markets/portugalia",
		copy: {
			preview: {
				welcomeTitle: "Bem-vindo",
				welcomeText:
					"O bot oficial da Volkswagen no Telegram, que permite ganhar dinheiro",
				earnText:
					"O bot paga por cada ação no aplicativo:\nbasta tocar no ecrã para ganhar dinheiro",
				withdrawTitle: "Levantamento de fundos",
				withdrawText: "Levante dinheiro para a sua conta bancária",
				start: "Começar",
				continue: "Continuar",
				imageAlt: "Pré-visualização Volkswagen",
			},
			tap: {
				error: "Ocorreu um erro, tente novamente",
				level: "Nível",
				upgrades: "🚀 Melhorias 💥",
			},
			profile: {
				balanceTitle: "Saldo da sua conta",
				withdrawCardTitle: "Levantamento de fundos",
				withdrawCardText: "Levante fundos para a sua conta bancária",
			},
			referral: {
				bonusAmount: 20,
				copied: "Link copiado",
				shareText: "💸Ganha comigo💸",
				friends: "Convidar amigos",
				inviteTitle: "Convidar amigos",
				bonusText: "Bónus de 20 euros por cada amigo convidado",
				inviteButton: "Enviar convite",
			},
			boost: {
				insufficientFunds: "Fundos insuficientes",
				upgraded: "Cliques melhorados",
				upgradeError: "Não foi possível melhorar os cliques",
				title: "Melhorias",
				energyTitle: "Aumente a sua energia",
				energyText:
					"Inscreva-se no canal do patrocinador e ganhe o dobro do dinheiro",
				tapsTitle: "Toques",
				tapsItem: "Toques",
				nextLevel: "niv.",
			},
			header: {
				avatarAlt: "Avatar do utilizador",
				levelSuffix: "niv.",
			},
			navigation: {
				profile: "Perfil",
				friends: "Amigos",
				earnings: "Prémio",
				upgrades: "Melhorias",
			},
			subscription: {
				missing: "Subscrição não encontrada, tente novamente",
				success: "Sucesso, recebeu energia x2",
				error: "Erro, tente novamente",
				completedTitle: "Já esgotei todas as tentativas",
				completedText: "Se quiseres ganhar dinheiro agora mesmo, inscreve-te no canal do patrocinador e ele irá ajudar-te.",
				subscribeCta: "Inscrever-se",
				text: "Se quiseres ganhar dinheiro agora mesmo, inscreve-te no canal do patrocinador e ele irá ajudar-te.",
				confirmCta: "Confirmar",
			},
			withdraw: {
				missingAmount: "Introduza o valor do levantamento",
				minimumAmount: "O valor mínimo de levantamento é 500 EUR",
				insufficientFunds: "Fundos insuficientes para levantamento",
				unavailable: "Levantamento temporariamente indisponível",
				title: "Levantamento de fundos",
				placeholder: "Valor (EUR)",
				cta: "Levantar dinheiro",
			},
			app: {
				webAppUnavailable: "Telegram WebApp não está disponível",
			},
		},
	},
	france: {
		key: "france",
		lang: "fr-FR",
		brand: "Renault",
		title: "Bot Telegram Renault",
		botUrl: "https://t.me/minese1bot",
		subscriptionUrl: "https://t.me/+eyNXjJndkF8zNzAy",
		subscriptionTitle: "L'avenir avec la Crypto 💻",
		assetsPath: "/markets/france",
		copy: {
			preview: {
				welcomeTitle: "Bienvenue",
				welcomeText:
					"Le bot officiel de Renault sur Telegram, qui\nrémunère les clics effectués dans l'application",
				earnText:
					"Le bot rémunère chaque clic dans\nl'application : il suffit de toucher l'écran pour gagner de l'argent",
				withdrawTitle: "Retrait",
				withdrawText: "Retirez votre argent sur votre\ncarte bancaire",
				start: "Commencer",
				continue: "Continuer",
				imageAlt: "Aperçu Renault",
			},
			tap: {
				error: "Une erreur est survenue, réessayez",
				level: "Niveau",
				upgrades: "🚀 Améliorations 💥",
			},
			profile: {
				balanceTitle: "Solde de votre compte",
				withdrawCardTitle: "Retrait de fonds",
				withdrawCardText: "Retirez votre argent sur votre carte bancaire",
			},
			referral: {
				bonusAmount: 2,
				copied: "Lien copié",
				shareText: "💸Gagne avec moi💸",
				friends: "Invitez vos amis",
				inviteTitle: "Invitez vos amis",
				bonusText: "Un bonus de 20 euros pour chaque ami invité",
				inviteButton: "Envoyer une invitation",
			},
			boost: {
				insufficientFunds: "Fonds insuffisants",
				upgraded: "Clics améliorés",
				upgradeError: "Impossible d'améliorer les clics",
				title: "Améliorations",
				energyTitle: "Augmentez vos revenus",
				energyText: "Abonnez-vous à la chaîne du sponsor",
				tapsTitle: "Application",
				tapsItem: "Niveau",
				nextLevel: "niv.",
			},
			header: {
				avatarAlt: "Avatar utilisateur",
				levelSuffix: "niv.",
			},
			navigation: {
				profile: "Profil",
				friends: "Amis",
				earnings: "Recettes",
				upgrades: "Améliorations",
			},
			subscription: {
				missing: "Abonnement introuvable, réessayez",
				success: "Succès, vous avez reçu l'énergie x2",
				error: "Erreur, réessayez",
				completedTitle: "Toutes les possibilités ont été épuisées",
				completedText:
					"Si vous souhaitez gagner de l'argent dès maintenant, abonnez-vous à la chaîne du sponsor et il vous aidera.",
				subscribeCta: "S'abonner",
				text: "Si vous souhaitez gagner de l'argent dès maintenant, abonnez-vous à la chaîne du sponsor et il vous aidera.",
				confirmCta: "Confirmer",
			},
			withdraw: {
				missingAmount: "Saisissez le montant du retrait",
				minimumAmount: "Le montant minimum de retrait est de 500 EUR",
				insufficientFunds: "Fonds insuffisants pour le retrait",
				unavailable: "Retrait temporairement indisponible",
				title: "Retrait de fonds",
				placeholder: "Montant (EUR)",
				cta: "Retirer l'argent",
			},
			app: {
				webAppUnavailable: "Telegram WebApp n'est pas disponible",
			},
		},
	},
};

const selectedMarket = markets[marketKey] || markets.portugal;
const botUrl = import.meta.env.VITE_REFERRAL_BOT_URL || selectedMarket.botUrl;
const botUsername = import.meta.env.VITE_REFERRAL_BOT_USERNAME;
const referralBotUrl = botUsername
	? `https://t.me/${botUsername.replace(/^@/, "")}`
	: botUrl;
const subscriptionBonusEnergy = Number(
	import.meta.env.VITE_SUBSCRIPTION_BONUS_ENERGY || 20,
);

export const branding = {
	...selectedMarket,
	title: import.meta.env.VITE_APP_TITLE || selectedMarket.title,
	referralBotUrl,
	subscriptionUrl:
		import.meta.env.VITE_SUBSCRIPTION_URL || selectedMarket.subscriptionUrl,
	subscriptionTitle:
		import.meta.env.VITE_SUBSCRIPTION_TITLE || selectedMarket.subscriptionTitle,
	subscriptionBonusEnergy,
	previewImages: [1, 2, 3].map(
		(imageNumber) =>
			`${selectedMarket.assetsPath}/bg${imageNumber}.png?v=${selectedMarket.key}-preview-v1`,
	),
	avatarUrl: `${selectedMarket.assetsPath}/tg_avatar.jpg?v=${selectedMarket.key}-avatar-v1`,
};

export const copy = branding.copy;
