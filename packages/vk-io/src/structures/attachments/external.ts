import { inspect } from 'util';

import { inspectCustomData } from '../../utils/constants';

export default class ExternalAttachment {
	public type: string;

	protected $filled: boolean;

	protected payload: object;

	/**
	 * Constructor
	 */
	public constructor(type: string, payload: object) {
		this.type = type;
		this.payload = payload;

		this.$filled = false;
	}

	/**
	 * Returns custom tag
	 */
	public get [Symbol.toStringTag](): string {
		return this.constructor.name;
	}

	/**
	 * Returns whether the attachment is filled
	 */
	public get isFilled(): boolean {
		return this.$filled;
	}


	/**
	 * Can be attached via string representation
	 */
	// eslint-disable-next-line class-methods-use-this
	public get canBeAttached(): boolean {
		return false;
	}

	/**
	 * Returns data for JSON
	 */
	public toJSON(): object {
		return this[inspectCustomData]();
	}

	/**
	 * Returns the custom data
	 */
	public [inspectCustomData](): object {
		return this.payload;
	}

	/**
	 * Custom inspect object
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public [inspect.custom](depth: number, options: Record<string, any>): string {
		const { name } = this.constructor;

		const customData = this[inspectCustomData]();

		const payload = inspect(customData, { ...options, compact: false });

		return `${options.stylize(name, 'special')} ${payload}`;
	}
}
