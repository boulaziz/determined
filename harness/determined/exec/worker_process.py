import faulthandler
import logging
import pathlib
import sys

from determined import ipc, layers, load


def config_logging(worker_process_env: layers.WorkerProcessContext) -> None:
    log_level = logging.DEBUG if worker_process_env.debug else logging.INFO
    logging.basicConfig(
        level=log_level, format="%(asctime)s:%(levelname)s [%(process)s]: %(message)s"
    )
    logging.getLogger().setLevel(log_level)
    logging.debug("Starting training process initialization.")


def main() -> None:
    if len(sys.argv) != 2:
        print("worker_process_env_path must be provided as a commandline argument", file=sys.stderr)
        sys.exit(1)

    # Load the worker process env.
    worker_process_env_path = pathlib.Path(sys.argv[1])
    worker_process_env = layers.WorkerProcessContext.from_file(worker_process_env_path)

    config_logging(worker_process_env)

    if worker_process_env.env.experiment_config.debug_enabled():
        faulthandler.dump_traceback_later(30, repeat=True)

    # Establish the connection to the ZMQBroadcastServer in this container.
    pub_url = f"tcp://localhost:{worker_process_env.broadcast_pub_port}"
    sub_url = f"tcp://localhost:{worker_process_env.broadcast_pull_port}"
    with ipc.ZMQBroadcastClient(pub_url, sub_url) as broadcast_client:

        # Wrap the communication layer in a workload.Stream.
        subrec = layers.SubprocessReceiver(broadcast_client)

        controller = load.prepare_controller(
            worker_process_env.env,
            iter(subrec),
            worker_process_env.load_path,
            worker_process_env.rendezvous_info,
            worker_process_env.hvd_config,
        )
        controller.run()


if __name__ == "__main__":
    main()