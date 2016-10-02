﻿/// <reference path="../../API.ts" />

/// <reference path="../external/ExternalSystemRole.ts" />

namespace samchon.protocol.distributed
{
	/**
	 * A role of Distributed Processing System.
	 * 
	 * The {@link DistributedSystemRole} is an abstract class who represents a **role**, *WHAT TO DO* in a Distributed 
	 * Processing System. Overrides the {@link DistributedSystemRole} and defines the *WHAT TO DO*.
	 * 
	 * Relationship between {@link DistributedSystem} and {@link DistributedSystemRole} objects are **M: N Associative**.
	 * Unlike {@link ExternalSystemRole}, the {@link DistributedSystemRole} objects are not belonged to a specific 
	 * {@link DistributedSystem} object. The {@link DistributedSystemRole} objects are belonged to the 
	 * {@link DistributedSystemArrayMediator} directly.
	 * 
	 * When you need the **distributed process**, then call {@link sendData sendData()}. The {@link sendData} will find
	 * the most idle {@link DistributedSystem slave system} considering not only number of processes on progress, but also
	 * {@link DistributedSystem.getPerformance performance index} of each {@link DistributedSystem} object and 
	 * {@link getResource resource index} of this {@link DistributedSystemRole} object. The {@link Invoke} message 
	 * requesting the **distributed process** will be sent to the most idle {@link DistributedSystem slave system}. 
	 * 
	 * Those {@link DistributedSystem.getPerformance performance index} and {@link getResource resource index} are 
	 * revaluated whenever the **distributed process** has completed basis on the execution time.
	 * 
	 * <a href="http://samchon.github.io/framework/images/design/ts_class_diagram/protocol_distributed_system.png"
	 *		  target="_blank">
	 *	<img src="http://samchon.github.io/framework/images/design/ts_class_diagram/protocol_distributed_system.png"
	 *		 style="max-width: 100%" />
	 * </a>
	 * 
	 * @handbook [Protocol - Distributed System](https://github.com/samchon/framework/wiki/TypeScript-Protocol-Distributed_System)
	 * @author Jeongho Nam <http://samchon.org>
	 */
	export abstract class DistributedSystemRole
		extends external.ExternalSystemRole
	{
		/**
		 * @hidden
		 */
		private system_array_: DistributedSystemArray;

		/**
		 * @hidden
		 */
		private progress_list_: std.HashMap<number, DSInvokeHistory>;
		
		/**
		 * @hidden
		 */
		private history_list_: std.HashMap<number, DSInvokeHistory>;

		/**
		 * @hidden
		 */
		private resource: number;

		/**
		 * @hidden
		 */
		private enforced_: boolean;

		/* ---------------------------------------------------------
			CONSTRUCTORS
		--------------------------------------------------------- */
		/**
		 * Constrct from parent {@link DistributedSystemArray} object.
		 * 
		 * @param systemArray The parent {@link DistributedSystemArray} object.
		 */
		public constructor(systemArray: DistributedSystemArray)
		{
			super(null);

			this.system_array_ = systemArray;

			// PERFORMANCE INDEX
			this.resource = 1.0;
			this.progress_list_ = new std.HashMap<number, DSInvokeHistory>();
			this.history_list_ = new std.HashMap<number, DSInvokeHistory>();
		}

		/* ---------------------------------------------------------
			ACCESSORS
		--------------------------------------------------------- */
		/**
		 * Get parent {@link DistributedSystemArray} object.
		 * 
		 * @return The parent {@link DistributedSystemArray} object.
		 */
		public getSystemArray(): DistributedSystemArray
		{
			return this.system_array_;
		}

		/**
		 * Get resource index.
		 * 
		 * Get *resource index* that indicates how much this {@link DistributedSystemRole role} is heavy.
		 * 
		 * If this {@link DistributedSystemRole role} does not have any	{@link Invoke} message had handled, then the
		 * *resource index* will be ```1.0```, which means default and average value between all 
		 * {@link DistributedSystemRole} instances (that are belonged to a same {@link DistributedSystemArray} object).
		 * 
		 * You can specify the *resource index* by yourself, but notice that, if the *resource index* is higher than 
		 * other {@link DistributedSystemRole} objects, then this {@link DistributedSystemRole role} will be ordered to
		 * handle less processes than other {@link DistributedSystemRole} objects. Otherwise, the *resource index* is 
		 * lower than others, of course, much processes will be requested.
		 * 
		 * - {@link setResource setResource()}
		 * - {@link enforceResource enforceResource()}
		 * 
		 * Unless {@link enforceResource enforceResource()} is called, This *resource index* is **revaluated** whenever
		 * {@link sendData sendData()} is called.
		 * 
		 * @return Resource index.
		 */
		public getResource(): number
		{
			return this.resource;
		}

		/**
		 * Set resource index.
		 * 
		 * Set *resource index* that indicates how much this {@link DistributedSystemRole role} is heavy. This 
		 * *resource index* can be **revaulated**.
		 * 
		 * Note that, initial and average *resource index* of {@link DistributedSystemRole} objects are ```1.0```. If the 
		 * *resource index* is higher than other {@link DistributedSystemRole} objects, then this 
		 * {@link DistributedSystemRole} will be ordered to handle more processes than other {@link DistributedSystemRole} 
		 * objects. Otherwise, the *resource index* is lower than others, of course, less processes will be requested.
		 * 
		 * Unlike {@link enforceResource}, configuring *resource index* by this {@link setResource} allows the 
		 * **revaluation**. This **revaluation** prevents wrong valuation from user. For example, you *mis-valuated* the 
		 * *resource index*. The {@link DistributedSystemRole role} is much heavier than any other, but you estimated it 
		 * to the lightest one. It looks like a terrible case that causes 
		 * {@link DistributedSystemArray entire distributed processing system} to be slower, however, don't mind. The 
		 * {@link DistributedSystemRole role} will the direct to the *propriate resource index* eventually with the 
		 * **revaluation**.
		 * 
		 * - The **revaluation** is caused by the {@link sendData sendData()} method.
		 * 
		 * @param val New resource index, but can be revaluated.
		 */
		public setResource(val: number): void
		{
			this.resource = val;
			this.enforced_ = false;
		}

		/**
		 * Enforce resource index.
		 * 
		 * Enforce *resource index* that indicates how much heavy the {@link DistributedSystemRole role is}. The 
		 * *resource index* will be fixed, never be **revaluated**.
		 *
		 * Note that, initial and average *resource index* of {@link DistributedSystemRole} objects are ```1.0```. If the
		 * *resource index* is higher than other {@link DistributedSystemRole} objects, then this
		 * {@link DistributedSystemRole} will be ordered to handle more processes than other {@link DistributedSystemRole}
		 * objects. Otherwise, the *resource index* is lower than others, of course, less processes will be requested.
		 * 
		 * The difference between {@link setResource} and this {@link enforceResource} is allowing **revaluation** or not. 
		 * This {@link enforceResource} does not allow the **revaluation**. The *resource index* is clearly fixed and 
		 * never be changed by the **revaluation**. But you've to keep in mind that, you can't avoid the **mis-valuation** 
		 * with this {@link enforceResource}.
		 * 
		 * For example, there's a {@link DistributedSystemRole role} much heavier than any other, but you 
		 * **mis-estimated** it to the lightest. In that case, there's no way. The 
		 * {@link DistributedSystemArray entire distributed processing system} will be slower by the **mis-valuation**. 
		 * By the reason, using {@link enforceResource}, it's recommended only when you can clearly certain the 
		 * *resource index*. If you can't certain the *resource index* but want to recommend, then use {@link setResource} 
		 * instead.
		 * 
		 * @param val New resource index to be fixed.
		 */
		public enforceResource(val: number): void 
		{
			this.resource = val;
			this.enforced_ = true;
		}

		/**
		 * @hidden
		 */
		private compute_average_elapsed_time(): number
		{
			let sum: number = 0;
			
			for (let it = this.history_list_.begin(); !it.equal_to(this.history_list_.end()); it = it.next())
			{
				let history: DSInvokeHistory = it.second;

				// THE SYSTEM'S PERFORMANCE IS 5. THE SYSTEM CAN HANDLE A PROCESS VERY QUICKLY
				// AND ELAPSED TIME OF THE PROCESS IS 3 SECONDS
				// THEN I CONSIDER THE ELAPSED TIME AS 15 SECONDS.
				sum += history.computeElapsedTime() * history.getSystem().getPerformance();
			}
			return sum / this.history_list_.size();
		}

		/* ---------------------------------------------------------
			INVOKE MESSAGE CHAIN
		--------------------------------------------------------- */
		/**
		 * Send an {@link Invoke} message.
		 * 
		 * Sends an {@link Invoke} message requesting a **distributed process**. The {@link Invoke} message will be sent
		 * to the most idle {@link DistributedSystem} object, which represents a slave system, and the most idle 
		 * {@link DistributedSystem} object will be returned.
		 * 
		 * When the **distributed process** has completed, then the {@link DistributedSystemArray} object will revaluate
		 * {@link getResource resource index} and {@link DistributedSystem.getPerformance performance index} of this
		 * {@link DistributedSystem} and the most idle {@link DistributedSystem} objects basis on the execution time. 
		 * 
		 * @param invoke An {@link Invoke} message requesting distributed process.
		 * @return The most idle {@link DistributedSystem} object who may send the {@link Invoke} message.
		 */
		public sendData(invoke: Invoke): DistributedSystem
		{
			if (this.system_array_.empty() == true)
				return;

			// ADD UID FOR ARCHIVING HISTORY
			let uid: number;
			if (invoke.has("_History_uid") == false)
			{
				// ISSUE UID AND ATTACH IT TO INVOKE'S LAST PARAMETER
				uid = ++this.system_array_["history_sequence_"];
				invoke.push_back(new InvokeParameter("_History_uid", uid));
			}
			else
			{
				// INVOKE MESSAGE ALREADY HAS ITS OWN UNIQUE ID
				//	- system_array_ IS A TYPE OF DistributedSystemArrayMediator. THE MESSAGE HAS COME FROM ITS MASTER
				//	- A Distributed HAS DISCONNECTED. THE SYSTEM SHIFTED ITS CHAIN TO ANOTHER SLAVE.
				uid = invoke.get("_History_uid").getValue();

				// FOR CASE 1. UPDATE HISTORY_SEQUENCE TO MAXIMUM
				this.system_array_["history_sequence_"] = uid;

				// FOR CASE 2. ERASE ORDINARY PROGRESSIVE HISTORY FROM THE DISCONNECTED
				this.progress_list_.erase(uid);
			}

			// ADD ROLE NAME FOR MEDIATOR
			if (invoke.has("_Role_name") == false)
				invoke.push_back(new InvokeParameter("_Role_name", this.name));

			// FIND THE MOST IDLE SYSTEM
			let idle_system: DistributedSystem = null;

			for (let i: number = 0; i < this.system_array_.size(); i++)
			{
				let system: DistributedSystem = this.system_array_.at(i) as DistributedSystem;
				if (system["exclude_"] == true)
					continue; // BEING REMOVED SYSTEM

				if (idle_system == null 
					|| system["progress_list_"].size() < idle_system["progress_list_"].size()
					|| system.getPerformance() < idle_system.getPerformance())
					idle_system = system;
			}

			if (idle_system == null)
				throw new std.OutOfRange("No remote system to send data");

			// ARCHIVE HISTORY ON PROGRESS_LIST (IN SYSTEM AND ROLE AT THE SAME TIME)
			let history: DSInvokeHistory = new DSInvokeHistory(idle_system, this, invoke);

			this.progress_list_.insert([uid, history]);
			idle_system["progress_list_"].insert([uid, std.make_pair(invoke, history)]);

			// SEND DATA
			idle_system.sendData(invoke);

			// RETURN THE IDLE SYSTEM, WHO SENT THE INVOKE MESSAGE.
			return idle_system;
		}

		/**
		 * @hidden
		 */
		private complete_history(history: DSInvokeHistory): void
		{
			// ERASE FROM ORDINARY PROGRESS AND MIGRATE TO THE HISTORY
			this.progress_list_.erase(history.getUID());
			this.history_list_.insert([history.getUID(), history]);
		}
	}
}