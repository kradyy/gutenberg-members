import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import Edit from './edit';
import Save from './save';

import settings from './member.json';
import metadata from '../block.json';

registerBlockType('create-block/team-member', {
	title: __('Team Member', 'team-members'),
	description: __('A team member item', 'team-members'),
	icon: 'admin-users',
	parent: [metadata.name],
	...settings,
	edit: Edit,
	save: Save,
});
