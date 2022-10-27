import { registerBlockType, createBlock } from '@wordpress/blocks';
import './team-member';
import './style.scss';
import edit from './edit';
import save from './save';
import metadata from './block.json';

const innerBlocks = (images) => {
	return images.map(({ url, id, alt }) => {
		return createBlock('create-block/team-member', {
			url,
			id,
			alt,
		});
	});
};
registerBlockType(metadata.name, {
	edit,
	save,
	transforms: {
		from: [
			{
				type: 'block',
				blocks: ['core/gallery'],
				transform: ({ images, columns }) => {
					return createBlock(
						metadata.name,
						{
							columns: columns || 2,
						},
						innerBlocks(images)
					);
				},
			},
			{
				type: 'block',
				blocks: ['core/image'],
				isMultiBlock: true,
				transform: (images) => {
					return createBlock(
						metadata.name,
						{
							columns: images.length > 3 ? 3 : images.length,
						},
						innerBlocks(images)
					);
				},
			},
		],
	},
});
