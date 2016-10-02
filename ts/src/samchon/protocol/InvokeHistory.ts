﻿/// <reference path="../API.ts" />

/// <reference path="Entity.ts" />
/// <reference path="EntityArray.ts" />

namespace samchon.protocol
{
	/**
	 * History of an {@link Invoke} message.
	 * 
	 * The {@link InvokeHistory} is a class archiving history log of an {@link Invoke} message with elapsed time. This 
	 * {@link InvokeHistory} class is used to report elapsed time of handling a requested process from **slave** to 
	 * **master** system. 
	 * 
	 * The **master** system utilizes derived {@link InvokeHistory} objects to compute performance indices.
	 * - {@link ParallelSytem.getPerformance}
	 * - {@link DistributedSystemRole.getResource}
	 * 
	 * @author Jeongho Nam <http://samchon.org>
	 */
	export class InvokeHistory 
		extends Entity
	{
		/**
		 * @hidden
		 */
		private uid: number;
		
		/**
		 * @hidden
		 */
		private listener: string;
		
		/**
		 * @hidden
		 */
		private start_time_: Date;
		
		/**
		 * @hidden
		 */
		private end_time_: Date;

		/* ---------------------------------------------------------
			CONSTRUCTORS
		--------------------------------------------------------- */
		/**
		 * Default Constructor.
		 */
		public constructor();

		/**
		 * Construct from an {@link Invoke} message.
		 * 
		 * @param invoke An {@link Invoke} message requesting a *parallel or distributed process*.
		 */
		public constructor(invoke: Invoke);

		public constructor(invoke: Invoke = null)
		{
			super();

			if (invoke == null)
			{
				// DEFAULT CONSTRUCTOR
				this.uid = 0;
				this.listener = "";
			}
			else
			{
				// CONSTRUCT FROM AN INVOKE MESSAGE
				this.uid = invoke.get("_History_uid").getValue();
				this.listener = invoke.getListener();

				this.start_time_ = new Date();
			}
		}

		/**
		 * @inheritdoc
		 */
		public construct(xml: library.XML): void
		{
			super.construct(xml);

			this.start_time_ = new Date(parseInt(xml.getProperty("startTime")));
			this.end_time_ = new Date(parseInt(xml.getProperty("endTime")));
		}

		/**
		 * Complete the history.
		 * 
		 * Completes the history and determines the {@link getEndTime end time}.
		 */
		public complete(): void
		{
			this.end_time_ = new Date();
		}

		/* ---------------------------------------------------------
			ACCESSORS
		--------------------------------------------------------- */
		public key(): number
		{
			return this.uid;
		}

		/**
		 * Get unique ID.
		 */
		public getUID(): number
		{
			return this.uid;
		}

		/**
		 * Get {@link Invoke.getListener listener} of the {@link Invoke} message.
		 */
		public getListener(): string
		{
			return this.listener;
		}

		/**
		 * Get start time.
		 */
		public getStartTime(): Date
		{
			return this.start_time_;
		}

		/**
		 * Get end time.
		 */
		public getEndTime(): Date
		{
			return this.end_time_;
		}

		/**
		 * Compute elapsed time.
		 * 
		 * @return milliseconds.
		 */
		public computeElapsedTime(): number
		{
			return Math.max(this.end_time_.getTime() - this.start_time_.getTime(), 1);
		}

		/* ---------------------------------------------------------
			EXPORTERS
		--------------------------------------------------------- */
		/**
		 * @inheritdoc
		 */
		public TAG(): string
		{
			return "history";
		}

		/**
		 * @inheritdoc
		 */
		public toXML(): library.XML
		{
			let xml: library.XML = super.toXML();
			xml.setProperty("startTime", this.start_time_.getTime() + "");
			xml.setProperty("endTime", this.end_time_.getTime() + "");

			return xml;
		}

		/**
		 * Convert to an {@link Invoke} message.
		 * 
		 * Creates and returns an {@link Invoke} message that is used to reporting to the **master**.
		 */
		public toInvoke(): Invoke
		{
			return new Invoke("_Report_history", this.toXML());
		}
	}
}