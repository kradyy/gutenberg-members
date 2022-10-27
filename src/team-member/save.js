import { useBlockProps, RichText } from '@wordpress/block-editor';
import settings from './member.json';
import { Icon } from '@wordpress/components';

export default function Save({ attributes }) {
	const blockProps = useBlockProps.save();

	const { name, bio, url, alt, id, socialLinks, blockClass } = attributes;

	return (
		<div {...blockProps}>
			{url && (
				<img
					src={url}
					alt={alt}
					className={id ? `wp-image-${id}` : null}
				/>
			)}
			{name && (
				<RichText.Content
					tagName={settings.attributes.name.selector}
					value={name}
				/>
			)}
			{bio && (
				<RichText.Content
					tagName={settings.attributes.bio.selector}
					value={bio}
				/>
			)}

			{socialLinks.length > 0 && (
				<div className={`${blockClass}-social-icons`}>
					<ul>
						{socialLinks.map((item, index) => {
							return (
								<li key={index} data-icon={item.icon}>
									<a href={item.link}>
										<Icon icon={item.icon} />
									</a>
								</li>
							);
						})}
					</ul>
				</div>
			)}
		</div>
	);
}
