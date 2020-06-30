import SuccessMessage from '../SuccessMessage';
import { shallow } from 'enzyme';
import { Alert } from 'tabler-react';

describe('SuccessMessage', () => {
  it('Should check for component SuccessMessage display', () => {
    const wrapper = shallow(<SuccessMessage message={'Success Message'} />);
    const messageAlert = wrapper.find(Alert).first();
    expect(messageAlert.html()).toContain('Success Message');
  });
});
