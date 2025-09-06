import { FuseSettingsConfigType } from '@fuse/core/FuseSettings/FuseSettings';

import i18n from '@i18n/i18n';

import en from './common-i18n/en';
import tw from './common-i18n/tw';

i18n.addResourceBundle('en', 'common', en);
i18n.addResourceBundle('tw', 'common', tw);

/**
 * The settingsConfig object is a configuration object for the Fuse application's settings.
 */
const settingsConfig: FuseSettingsConfigType = {
	customScrollbars: true,
	direction: 'ltr',
	layout: {
		style: 'layout1',
		config: {
			mode: 'container',
			containerWidth: 1120,
			navbar: {
				display: true,
				style: 'style-2',
				folded: true,
				position: 'left',
				open: true
			},
			toolbar: {
				display: true,
				style: 'fixed',
				position: 'below'
			},
			footer: {
				display: false,
				style: 'static'
			},
			leftSidePanel: {
				display: true
			},
			rightSidePanel: {
				display: true
			}
		}
	},
	theme: {
		main: {
			palette: {
				mode: 'light',
				text: {
					primary: 'rgb(17, 24, 39)',
					secondary: 'rgb(107, 114, 128)',
					disabled: 'rgb(149, 156, 169)'
				},
				common: {
					black: '#000000',
					white: '#FFFFFF'
				},
				primary: {
					light: '#62727B',
					main: '#37474F',
					dark: '#102027',
					contrastDefaultColor: 'light',
					contrastText: 'rgb(255,255,255)'
				},
				secondary: {
					light: '#FF6659',
					main: '#D32F2F',
					dark: '#9A0007',
					contrastText: 'rgb(255,255,255)'
				},
				background: {
					paper: '#f2f2f2',
					default: '#e6e6e6'
				},
				error: {
					light: '#FFCDD2',
					main: '#D32F2F',
					dark: '#B71C1C',
					contrastText: '#FFFFFF'
				},
				divider: '#d9d9d9'
			}
		},
		navbar: {
			palette: {
				mode: 'dark',
				text: {
					primary: 'rgb(255,255,255)',
					secondary: 'rgb(148, 163, 184)',
					disabled: 'rgb(156, 163, 175)'
				},
				common: {
					black: '#000000',
					white: '#FFFFFF'
				},
				primary: {
					light: '#62727B',
					main: '#37474F',
					dark: '#102027',
					contrastDefaultColor: 'light',
					contrastText: 'rgb(255,255,255)'
				},
				secondary: {
					light: '#FF6659',
					main: '#D32F2F',
					dark: '#9A0007',
					contrastText: 'rgb(255,255,255)'
				},
				background: {
					paper: '#2e2e2e',
					default: '#212121'
				},
				error: {
					light: '#FFCDD2',
					main: '#D32F2F',
					dark: '#B71C1C',
					contrastText: '#FFFFFF'
				},
				divider: '#3a3d40'
			}
		},
		toolbar: {
			palette: {
				mode: 'light',
				text: {
					primary: 'rgb(17, 24, 39)',
					secondary: 'rgb(107, 114, 128)',
					disabled: 'rgb(149, 156, 169)'
				},
				common: {
					black: '#000000',
					white: '#FFFFFF'
				},
				primary: {
					light: '#62727B',
					main: '#37474F',
					dark: '#102027',
					contrastDefaultColor: 'light',
					contrastText: 'rgb(255,255,255)'
				},
				secondary: {
					light: '#FF6659',
					main: '#D32F2F',
					dark: '#9A0007',
					contrastText: 'rgb(255,255,255)'
				},
				background: {
					paper: '#f2f2f2',
					default: '#e6e6e6'
				},
				error: {
					light: '#FFCDD2',
					main: '#D32F2F',
					dark: '#B71C1C',
					contrastText: '#FFFFFF'
				},
				divider: '#d9d9d9'
			}
		},
		footer: {
			palette: {
				mode: 'dark',
				text: {
					primary: 'rgb(255,255,255)',
					secondary: 'rgb(148, 163, 184)',
					disabled: 'rgb(156, 163, 175)'
				},
				common: {
					black: '#000000',
					white: '#FFFFFF'
				},
				primary: {
					light: '#62727B',
					main: '#37474F',
					dark: '#102027',
					contrastDefaultColor: 'light',
					contrastText: 'rgb(255,255,255)'
				},
				secondary: {
					light: '#FF6659',
					main: '#D32F2F',
					dark: '#9A0007',
					contrastText: 'rgb(255,255,255)'
				},
				background: {
					paper: '#2e2e2e',
					default: '#212121'
				},
				error: {
					light: '#FFCDD2',
					main: '#D32F2F',
					dark: '#B71C1C',
					contrastText: '#FFFFFF'
				},
				divider: '#3a3d40'
			}
		}
	},
	defaultAuth: ['admin'],
	loginRedirectUrl: '/'
};

export default settingsConfig;
