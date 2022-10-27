import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	RichText,
	MediaPlaceholder,
	BlockControls,
	MediaReplaceFlow,
	InspectorControls,
} from '@wordpress/block-editor';
import { useEffect, useState, useRef } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { usePrevious } from '@wordpress/compose';
import { isBlobURL, revokeBlobURL } from '@wordpress/blob';
import {
	Spinner,
	withNotices,
	ToolbarButton,
	PanelBody,
	TextareaControl,
	SelectControl,
	Icon,
	Tooltip,
	TextControl,
	Button,
} from '@wordpress/components';
import {
	DndContext,
	useSensor,
	useSensors,
	PointerSensor,
} from '@dnd-kit/core';
import {
	SortableContext,
	horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';

import settings from './member.json';
import SortableItem from './sortable-item';

function Edit(props) {
	const {
		attributes,
		setAttributes,
		className,
		noticeOperations,
		noticeUI,
		isSelected,
	} = props;

	const { name, bio, alt, id, url, socialLinks } = attributes;

	const [blobURL, setBlobURL] = useState();

	const [selectedSocialMediaIconIndex, setSelectedSocialMediaIconIndex] =
		useState();

	const prevURL = usePrevious(url);
	const titleRef = useRef(0);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 5 },
		})
	);

	const imageObject = useSelect(
		(store) => {
			const { getMedia } = store('core');
			return id ? getMedia(id) : null;
		},
		[id]
	);

	const themeImageSizes = useSelect((store) => {
		const { getSettings } = store('core/block-editor');
		return getSettings().imageSizes;
	}, []);

	const onSelectURL = (newURL) => {
		setAttributes({ url, newURL, alt: '' });
	};

	const onSelectImage = async (image) => {
		if (!image || !image.url) {
			removeImage();
			return;
		}

		setAttributes({
			id: image.id,
			alt: image.alt,
			url: image.url,
		});
	};

	const isImageUploading = () => {
		return url && isBlobURL(url);
	};

	const onUploadError = (message) => {
		noticeOperations.removeAllNotices();
		noticeOperations.createErrorNotice(message);
	};

	const removeImage = () => {
		setAttributes({ url: undefined, id: undefined, alt: '' });
	};

	const getAvailableImageSizes = () => {
		if (!imageObject) return [];

		// Using reduce instead of - for(const s in sizes) to get keys and adding
		// To and array, ie. sizes[]
		const sizes = imageObject.media_details.sizes;

		return Object.keys(sizes).reduce((arr, key) => {
			const match = themeImageSizes.find((e) => e.slug === key);

			return match
				? arr.push({
						label: match.name,
						value: sizes[key].source_url,
				  }) && arr
				: arr;
		}, []);
	};

	const addSocialMediaicon = () => {
		setAttributes({
			socialLinks: [...socialLinks, { link: '', icon: 'wordpress' }],
		});

		setSelectedSocialMediaIconIndex(socialLinks.length);
	};

	const updateSocialMediaIcon = (value, type) => {
		const links = [...socialLinks];

		if (!selectedSocialMediaIconIndex) return;

		links[selectedSocialMediaIconIndex][type] = value;

		setAttributes({
			socialLinks: links,
		});
	};

	const removeSocialMediaIcon = () => {
		if (!selectedSocialMediaIconIndex) {
			return;
		}

		if (socialLinks[selectedSocialMediaIconIndex] !== undefined) {
			socialLinks.splice(selectedSocialMediaIconIndex, 1);
			setSelectedSocialMediaIconIndex(undefined);

			setAttributes({
				socialLinks,
			});
		}
	};

	// Clean up blobs and set className
	useEffect(() => {
		if (!id && isBlobURL(url)) {
			setAttributes({
				url: undefined,
				alt: '',
			});
		}

		setAttributes({ blockClass: className });
	}, []);

	useEffect(() => {
		if (isBlobURL(url)) {
			setBlobURL(url);
		}

		if (id && blobURL) {
			//console.log('blob url revoked: ' + blobURL);
			revokeBlobURL(blobURL);
			setBlobURL();
		}
	}, [url]);

	// We have an URL and did not have a previous one
	useEffect(() => {
		if (url && !prevURL && isSelected) {
			titleRef.current.focus();
		}
	}, [url, prevURL]);

	const imageProps = {
		onSelectURL,
		icon: 'admin-users',
		onSelect: onSelectImage,
		onError: onUploadError,
		allowedTypes: ['image'],
		accept: 'image/*',
		disableMediaButtons: url,
		notices: noticeUI,
		mediaId: id,
		mediaUrl: url,
	};

	const sortableIds = socialLinks.map((item) => {
		return item.link + item.icon;
	});

	const handleDragEnd = (event) => {
		const { active, over } = event;

		if (active && over && active.id !== over.id) {
			const oldIndex = socialLinks.findIndex(
				(i) => i.link + i.icon === active.id
			);
			const newIndex = socialLinks.findIndex(
				(i) => i.link + i.icon === over.id
			);

			if (oldIndex !== -1 && newIndex !== -1) {
				const x = socialLinks[oldIndex];
				socialLinks[oldIndex] = socialLinks[newIndex];
				socialLinks[newIndex] = x;
			}

			setAttributes({
				socialLinks: socialLinks.slice(),
			});

			setSelectedSocialMediaIconIndex(newIndex);
		}
	};

	return (
		<>
			{url && (
				<BlockControls group="inline">
					<MediaReplaceFlow
						name={__('Byt bild', 'team-members')}
						{...imageProps}
					/>
					<ToolbarButton onClick={removeImage}>
						{__('Ta bort bild', 'team-members')}
					</ToolbarButton>
				</BlockControls>
			)}

			<InspectorControls>
				<PanelBody
					title={__('Inställningar för bild', 'team-members')}
					icon="image"
					initialOpen
				>
					{url && !isBlobURL(url) && (
						<TextareaControl
							label={__('Alt text', 'team-members')}
							help={__(
								'Lägg till en beskrivande text av bilden.',
								'team-member'
							)}
							value={alt}
							onChange={(_alt) => setAttributes({ alt: _alt })}
						/>
					)}

					{id && (
						<SelectControl
							label={__('Storlek', 'team-members')}
							options={getAvailableImageSizes()}
							value={url}
							onChange={(_url) => setAttributes({ url: _url })}
						/>
					)}
				</PanelBody>
			</InspectorControls>

			<div {...useBlockProps()}>
				{url && (
					<div className={`${className}-img-preview`}>
						{isImageUploading() && <Spinner />}
						<img
							src={url}
							alt={alt}
							style={
								isImageUploading()
									? { opacity: 0.5 }
									: { opacity: 1 }
							}
						/>
					</div>
				)}

				<MediaPlaceholder {...imageProps} />
				<RichText
					placeholder={__('Member name', 'team-members')}
					tagName={settings.attributes.name.selector}
					value={name}
					ref={titleRef}
					allowedFormats={[]}
					onChange={(_name) => setAttributes({ name: _name })}
				/>
				<RichText
					placeholder={__('Bio', 'team-members')}
					tagName={settings.attributes.bio.selector}
					value={bio}
					allowedFormats={[]}
					onChange={(_bio) => setAttributes({ bio: _bio })}
				/>

				<div className={`${className}-social-icons`}>
					<ul>
						<DndContext
							sensors={sensors}
							onDragEnd={handleDragEnd}
							modifiers={[restrictToHorizontalAxis]}
						>
							<SortableContext
								items={sortableIds}
								strategy={horizontalListSortingStrategy}
							>
								{socialLinks.map((item, index) => {
									return (
										<SortableItem
											key={index}
											id={item.link + item.icon}
											name={item.icon}
											index={index}
											selectedSocialMediaIconIndex={
												selectedSocialMediaIconIndex
											}
											setSelectedSocialMediaIconIndex={
												setSelectedSocialMediaIconIndex
											}
											icon={item.icom}
											item={item}
											isSelected={isSelected}
										/>
									);
								})}
							</SortableContext>
						</DndContext>

						{isSelected && (
							<li className={`${className}-add-social-icon`}>
								<Tooltip
									text={__('Add an icon', 'team-members')}
								>
									<button
										onClick={addSocialMediaicon}
										aria-label={__(
											'Add an icon',
											'team-members'
										)}
									>
										<Icon icon="plus" />
									</button>
								</Tooltip>
							</li>
						)}
					</ul>
				</div>

				{selectedSocialMediaIconIndex !== undefined && (
					<div className={`${className}-link-form`}>
						<TextControl
							label={__('Icon', 'team-member')}
							value={
								socialLinks[selectedSocialMediaIconIndex].icon
							}
							onChange={(value) =>
								updateSocialMediaIcon(value, 'icon')
							}
						/>
						<TextControl
							label={__('URL', 'team-member')}
							value={
								socialLinks[selectedSocialMediaIconIndex].link
							}
							onChange={(value) =>
								updateSocialMediaIcon(value, 'link')
							}
						/>
						<Button isDestructive onClick={removeSocialMediaIcon}>
							{__('Remove Link', 'team-members')}
						</Button>
					</div>
				)}
			</div>
		</>
	);
}

export default withNotices(Edit);
