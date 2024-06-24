import subprocess
import tempfile


def is_valid_age_key(secret_key: str) -> bool:
    # Run the age-keygen command with the -y flag to check the key format
    result = subprocess.run(
        ["age-keygen", "-y"], input=secret_key, capture_output=True, text=True
    )

    if result.returncode == 0:
        return True
    else:
        raise ValueError(f"Invalid age key: {secret_key}")


def is_valid_ssh_key(secret_key: str, ssh_pub: str) -> bool:
    # create tempfile and write secret_key to it
    with tempfile.NamedTemporaryFile() as temp:
        temp.write(secret_key.encode("utf-8"))
        temp.flush()
        # Run the ssh-keygen command with the -y flag to check the key format
        result = subprocess.run(
            ["ssh-keygen", "-y", "-f", temp.name], capture_output=True, text=True
        )

        if result.returncode == 0:
            if result.stdout != ssh_pub:
                raise ValueError(
                    f"Expected '{ssh_pub}' got '{result.stdout}' for ssh key: {secret_key}"
                )
            return True
        else:
            raise ValueError(f"Invalid ssh key: {secret_key}")
