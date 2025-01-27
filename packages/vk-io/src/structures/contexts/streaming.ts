import Context, { IContextOptions } from './context';

import { Attachment } from '../attachments';
import { copyParams } from '../../utils/helpers';
import { transformAttachments } from '../attachments/helpers';
import { platforms, inspectCustomData } from '../../utils/constants';

export interface IStreamingContextPayload {
	event_type: 'post' | 'comment' | 'share' | 'topic_post';
	event_id: {
		post_owner_id?: number;
		post_id?: number;
		comment_id?: number;
		shared_post_id?: number;
		topic_owner_id?: number;
		topic_id?: number;
		topic_post_id?: number;
	};
	event_url: string;
	text?: string;
	action: 'new' | 'update' | 'delete' | 'restore';
	action_time: number;
	creation_time: number;
	attachments: object[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	geo: Record<string, any>;
	shared_post_text?: string;
	shared_post_creation_time?: number;
	signer_id: number;
	tags: string[];
	author: {
		id: number;
		author_url: string;
		shared_post_author_id?: number;
		shared_post_author_url?: string;
		platform?: number;
	};
}

export type StreamingContextOptions<S> =
	Omit<IContextOptions<IStreamingContextPayload, S>, 'type' | 'subTypes'>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class StreamingContext<S = Record<string, any>>
	extends Context<IStreamingContextPayload, S> {
	public attachments: Attachment[];

	public constructor(options: StreamingContextOptions<S>) {
		const { action, event_type: type } = options.payload;

		super({
			...options,

			type: 'publication',
			subTypes: [
				`publication_${type}`,
				`${action}_publication`,
				`${action}_publication_${type}`
			]
		});

		this.attachments = transformAttachments(this.payload.attachments, this.vk);
	}

	/**
	 * Checks is new object
	 */
	public get isNew(): boolean {
		return this.actionType === 'new';
	}

	/**
	 * Checks is update object
	 */
	public get isUpdate(): boolean {
		return this.actionType === 'update';
	}

	/**
	 * Checks is delete object
	 */
	public get isDelete(): boolean {
		return this.actionType === 'delete';
	}

	/**
	 * Checks is restore object
	 */
	public get isRestore(): boolean {
		return this.actionType === 'restore';
	}

	/**
	 * Checks is post event
	 */
	public get isPost(): boolean {
		return this.eventType === 'post';
	}

	/**
	 * Checks is share event
	 */
	public get isShare(): boolean {
		return this.eventType === 'share';
	}

	/**
	 * Checks is comment event
	 */
	public get isComment(): boolean {
		return this.eventType === 'comment';
	}

	/**
	 * Checks for the presence of attachments
	 */
	public hasAttachments(type: string = null): boolean {
		if (type === null) {
			return this.attachments.length > 0;
		}

		return this.attachments.some(attachment => (
			attachment.type === type
		));
	}

	/**
	 * Returns the event URL
	 */
	public get url(): string {
		return this.payload.event_url;
	}

	/**
	 * Returns the creation time
	 */
	public get createdAt(): number {
		return this.payload.creation_time;
	}

	/**
	 * Returns the text of the post
	 */
	public get text(): string | null {
		return this.payload.text || null;
	}

	/**
	 * Returns the text of the shared post
	 */
	public get sharedText(): string | null {
		return this.payload.shared_post_text || null;
	}

	/**
	 * Returns the creation time from original post
	 */
	public get sharedAt(): number | null {
		return this.payload.shared_post_creation_time || null;
	}

	/**
	 * Returns the action type
	 */
	public get actionType(): string {
		return this.payload.action;
	}

	/**
	 * Returns the event type
	 */
	public get eventType(): string {
		return this.payload.event_type;
	}

	/**
	 * Returns the creation time from
	 */
	public get actionAt(): number {
		return this.payload.action_time;
	}

	/**
	 * Returns the geo location
	 */
	public get geo(): object {
		return this.payload.geo;
	}

	/**
	 * Returns the rule tags
	 */
	public get tags(): string[] {
		return this.payload.tags;
	}

	/**
	 * Returns the identifier signer user
	 */
	public get signerId(): number {
		return this.payload.signer_id;
	}

	/**
	 * Returns the information of author
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public get author(): Record<string, any> {
		return this.payload.author;
	}

	/**
	 * Returns the identifier author
	 */
	public get authorId(): number {
		return this.payload.author.id;
	}

	/**
	 * Returns the author url
	 */
	public get authorUrl(): string {
		return this.payload.author.author_url;
	}

	/**
	 * Returns the identifier of the author of the original post
	 */
	public get sharedAuthorId(): number | null {
		return this.payload.author.shared_post_author_id || null;
	}

	/**
	 * Returns the author url of the original post
	 */
	public get sharedAuthorUrl(): string | null {
		return this.payload.author.shared_post_author_url || null;
	}

	/**
	 * Returns the author platform
	 */
	public get authorPlatform(): string | null {
		return platforms.get(this.payload.author.platform);
	}

	/**
	 * Returns the attachments
	 */
	public getAttachments(type: string = null): Attachment[] {
		if (type === null) {
			return this.attachments;
		}

		return this.attachments.filter(attachment => (
			attachment.type === type
		));
	}

	/**
	 * Returns the custom data
	 */
	public [inspectCustomData](): object {
		const properties = [
			'url',
			'created',
			'text',
			'sharedText',
			'sharedAt',
			'actionType',
			'eventType',
			'actionAt',
			'geo',
			'tags',
			'signerId',
			'author',
			'authorId',
			'authorUrl',
			'sharedAuthorId',
			'sharedAuthorUrl',
			'authorPlatform',
			'isNew',
			'isUpdate',
			'isDelete',
			'isRestore',
			'isPost',
			'isShare',
			'isComment'
		];

		const filtredEmptyProperties = properties.filter(property => (
			this[property] !== null
		));

		// @ts-ignore
		return copyParams(this, filtredEmptyProperties);
	}
}
