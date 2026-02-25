resource "aws_instance" "test-server" {
  ami                    = "ami-0f71013b2c8bd2c29"
  instance_type         = "t2.micro"
  key_name              = "projectBanking"
  vpc_security_group_ids = ["sg-0290f9f790be5f3e3"]  # This line is fine

  connection {
    type        = "ssh"
    user        = "ec2-user"
    private_key = file("./projectBanking.pem")
    host        = self.public_ip
  }

  provisioner "remote-exec" {
    inline = ["echo 'wait to start the instance'"]
  }

  tags = {
    Name = "test-server"
  }

  provisioner "local-exec" {
    command = "echo ${self.public_ip} > inventory"
  }

  provisioner "local-exec" {
    command = "ansible-playbook /var/lib/jenkins/workspace/BankingProject/terraform-files/ansibleplaybook.yml"
  }
}
