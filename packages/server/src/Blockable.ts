import EventEmitter from 'events';

/** A mutex implementation */
export abstract class Blockable extends EventEmitter {
  private mutex: Record<string, boolean> = {};

  protected isBlocked(blockingEvent: string) {
    return !!this.mutex[blockingEvent];
  }

  protected async available(blockingEvent: string) {
    await new Promise<void>((resolve) => {
      const handler = () => {
        this.removeListener(blockingEvent, handler);
        resolve();
      };
      this.addListener(blockingEvent, handler);
    });
  }

  protected async acquire(blockingEvent: string) {
    if (this.isBlocked(blockingEvent)) {
      await this.available(blockingEvent);
    }
    this.mutex[blockingEvent] = true;
  }

  protected release(blockingEvent: string) {
    this.mutex[blockingEvent] = false;
    this.emit(blockingEvent);
  }
}
