import VK from '../../vk';

import Attachment from './attachment';

import { attachmentTypes } from '../../utils/constants';

const { MARKET_ALBUM } = attachmentTypes;

export interface IMarketAlbumAttachmentPayload {
	id: number;
	owner_id: number;
	access_key: string;

	title?: string;
	photo?: object;
	count?: number;
	updated_time?: number;
}

export default class MarketAlbumAttachment extends Attachment {
	protected vk: VK;

	protected payload: IMarketAlbumAttachmentPayload;

	/**
	 * Constructor
	 */
	public constructor(payload: IMarketAlbumAttachmentPayload, vk: VK) {
		super(MARKET_ALBUM, payload.owner_id, payload.id, payload.access_key);

		this.vk = vk;
		this.payload = payload;

		this.$filled = 'title' in payload && 'updated_time' in payload;
	}

	/**
	 * Load attachment payload
	 */
	public async loadAttachmentPayload(): Promise<void> {
		if (this.$filled) {
			return;
		}

		// @ts-ignore
		const [album] = await this.vk.api.market.getAlbumById({
			owner_id: this.ownerId,
			album_ids: this.id
		});

		this.payload = album;

		if ('access_key' in this.payload) {
			this.accessKey = this.payload.access_key;
		}

		this.$filled = true;
	}
}
