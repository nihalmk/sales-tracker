import ErrorMessage from '../ErrorMessage';
import { shallow } from 'enzyme';
import { Alert } from 'tabler-react';

describe('ErrorMessage', () => {
  it('Should check for component ErrorMessage display', () => {
    const wrapper = shallow(<ErrorMessage error={'Error Message'} />);
    const messageAlert = wrapper.find(Alert).first();
    expect(messageAlert.html()).toContain('Error Message');
  });
});
