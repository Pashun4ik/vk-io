import { inspect } from 'util';

import { VKError } from '../errors';

import VK from '../vk';
import Request from '../api/request';
import { getChainReturn, resolveExecuteTask } from '../utils/helpers';

export default class Chain {
	public started = false;

	protected vk: VK;

	protected queue = [];

	/**
	 * Constructor
	 */
	constructor(vk: VK) {
		this.vk = vk;
	}

	/**
	 * Returns custom tag
	 */
	// eslint-disable-next-line class-methods-use-this
	get [Symbol.toStringTag](): string {
		return 'Chain';
	}

	/**
	 * Adds method to queue
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	append(method: string, params: object): Promise<any> {
		if (this.started) {
			return Promise.reject(new VKError({
				message: 'Chain already started',
				code: 'ALREADY_STARTED'
			}));
		}

		const request = new Request(method, params);

		this.queue.push(request);

		return request.promise;
	}

	/**
	 * Promise based
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	then(thenFn, catchFn): Promise<any[]> {
		return Promise.resolve(this.run()).then(thenFn, catchFn);
	}

	/**
	 * Starts the chain
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async run(): Promise<{ response: any[]; errors: any[] }> {
		if (this.started) {
			throw new VKError({
				message: 'Chain already started',
				code: 'ALREADY_STARTED'
			});
		}

		this.started = true;

		const { queue } = this;

		let out = {
			response: [],
			errors: []
		};

		if (queue.length === 0) {
			return out;
		}

		while (queue.length > 0) {
			const tasks = queue.splice(0, 25);
			const code = getChainReturn(tasks.map(String));

			try {
				const response = await this.vk.api.execute({ code });

				resolveExecuteTask(tasks, response);

				out = {
					response: [...out.response, ...response.response],
					errors: [...out.errors, ...response.errors]
				};
			} catch (error) {
				for (const task of tasks) {
					task.reject(error);
				}

				throw error;
			}
		}

		return out;
	}

	/**
	 * Custom inspect object
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public [inspect.custom](depth: number, options: Record<string, any>): string {
		const { name } = this.constructor;
		const { started, queue } = this;

		const payload = { started, queue };

		return `${options.stylize(name, 'special')} ${inspect(payload, options)}`;
	}
}
