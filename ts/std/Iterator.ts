﻿/// <reference path="Container.ts" />

/// <reference path="Exception.ts" />

namespace std
{
    export class Iterator<T>
    {
        protected source: Container<T>;

        /* ---------------------------------------------------------
		    CONSTRUCTORS
	    --------------------------------------------------------- */
        /**
         * Construct from the source Container.
         *
         * @param source The source Container.
         */
        public constructor(source: Container<T>)
        {
            this.source = source;
        }

        /* ---------------------------------------------------------
		    MOVERS
	    --------------------------------------------------------- */
        /**
         * Get iterator to previous element.
         */
        public prev(): Iterator<T>
        {
            throw new std.AbstractMethodError("Have to be overriden.");
        }

        /**
         * Get iterator to next element.
         */
        public next(): Iterator<T>
        {
            throw new std.AbstractMethodError("Have to be overriden.");
        }

        /**
         * Advances the Iterator by n element positions.
         *
         * @param n Number of element positions to advance.
         * @return An advanced Iterator.
         */
        public advance(n: number): Iterator<T>
        {
            var it: Iterator<T> = this;
            var i: number;

            if (n >= 0 )
            {
                for (i = 0; i < n; i++)
                    if (it.equals(this.source.end()))
                        return this.source.end();
                    else
                        it = it.next();
            }
            else
            {
                n = n * -1;

                for (i = 0; i < n; i++)
                    if (it.equals(this.source.end()))
                        return this.source.end();
                    else
                        it = it.prev();
            }

            return it;
        }

        /* ---------------------------------------------------------
		    ACCESSORS
	    --------------------------------------------------------- */
        /**
         * Get source.
         */
        public getSource(): Container<T>
        {
            return this.source;
        }

        public equals<U extends T>(obj: Iterator<U>): boolean
        {
            return this.source == obj.source;
        }
        
        /**
         * Get value.
         */
        public get value(): T
        {
            throw new std.AbstractMethodError("Have to be overriden.");
        }

        /**
         * Set value.
         */
        public set value(val: T)
        {
            throw new std.AbstractMethodError("Have to be overriden.");
        }
    }
}