import {
	useBlockProps,
	InnerBlocks,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody, RangeControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import './editor.scss';

export default function Edit({ attributes, setAttributes }) {
	const { columns } = attributes;

	return (
		<div
			{...useBlockProps({
				className: `has-${columns}-columns`,
			})}
		>
			<InspectorControls>
				<PanelBody>
					<RangeControl
						label={__('Columns', 'team-members')}
						value={columns}
						min={1}
						max={6}
						onChange={(e) => setAttributes({ columns: e })}
					/>
				</PanelBody>
			</InspectorControls>

			<InnerBlocks
				allowedBlocks={['create-block/team-member']}
				orientation="horizontal"
				template={[
					['create-block/team-member'],
					['create-block/team-member'],
					['create-block/team-member'],
				]}
			/>
		</div>
	);
}

/*
templateLock="all"
[
	'create-block/team-member',
	{
		name: 'Team member two',
		bio: 'Biography',
	},
],
*/
